# MercadoPago Checkout Pro — Integration Audit & Hardening

This document captures the audit of the custom Payload eCommerce `PaymentAdapter`
that integrates MercadoPago Checkout Pro, the findings against the official
docs, and the corrective actions that were applied. Keep it as the source of
truth for why each non-obvious decision exists in the code.

References used during the audit:

- Payload eCommerce — payment adapters: https://payloadcms.com/docs/ecommerce/payments
- MercadoPago Checkout Pro overview: https://www.mercadopago.com.co/developers/es/docs/checkout-pro/overview
- MercadoPago Webhooks (signature manifest): https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/webhooks
- `@payloadcms/plugin-ecommerce` types: `node_modules/@payloadcms/plugin-ecommerce/dist/types/index.d.ts`
- `mercadopago` SDK v2.x: `node_modules/mercadopago/dist/clients/preference/commonTypes.d.ts`

---

## How the integration is wired

- Adapter: `src/modules/checkout/payment-methods/mercadopago/mercadopago.adapter.ts` —
  exposes `name`, `label`, the admin `group`, the `endpoints` array, and the
  `initiatePayment` / `confirmOrder` factories.
- Registration: `src/infrastructure/plugins/plugins.config.ts` — wired into
  `ecommercePlugin.payments.paymentMethods`.
- Preference creation: `initiate-payment.handler.ts`.
- Webhook + signature validation: `webhook.endpoint.ts`. Mounted at
  `/api/payments/mercadopago/webhooks` per Payload convention.
- Order reconciliation (shared between webhook and confirmOrder):
  `create-order-from-payment.handler.ts` — uses
  `payload.db.beginTransaction()` plus a unique constraint on
  `orders.transaction` so the two paths are idempotent.
- Frontend: `src/modules/checkout/components/checkout-page/use-checkout-page.ts`
  redirects to `init_point` / `sandbox_init_point`;
  `src/modules/checkout/components/confirm-order/use-confirm-order.ts` polls
  `confirmOrder` with `payment_id` from the MP redirect.
- SDK pinned: `"mercadopago": "^2.12.0"`.

---

## What was already correct (validated against the docs)

1. Adapter shape conforms to Payload's `PaymentAdapter` (`name`, `label`,
   `endpoints`, `group`, `initiatePayment`, `confirmOrder`).
2. Webhook path matches the plugin convention (`/api/payments/{provider}/webhooks`).
3. HMAC signature validation matches MP's published algorithm:
   - `x-signature` parsed by splitting on `,` then `=`.
   - Manifest is `id:${dataId};request-id:${xRequestId};ts:${ts};` with the
     mandatory trailing semicolon.
   - HMAC-SHA256 hex, compared to the `v1` field.
4. Preference creation uses the official SDK (`MercadoPagoConfig` +
   `new Preference(client).create({ body })`).
5. `auto_return: 'approved'` is conditionally sent only when `serverURL` is
   HTTPS. MP requires `back_urls.success` to be HTTPS for `auto_return`, so
   this guard prevents 400s on localhost.
6. `external_reference` carries the local transaction ID and is the linkage
   point for the webhook and `confirmOrder`.
7. Race condition between webhook and `confirmOrder` is handled via a DB
   transaction + unique constraint on `orders.transaction`.
8. Non-`payment` notification types (e.g. `merchant_order`) are acknowledged
   with 200 OK so MP doesn't retry forever.

---

## Findings and how they were addressed

### F1 — Webhook secret missing in `.env`

`initiate-payment.handler.ts` throws `'Mercado Pago webhook secret is required.'`
on every checkout if the env var is missing.

**Fix:** `MERCADOPAGO_WEBHOOK_SECRET` is now set in `.env` (was commented out).

### F2 — `.env.example` did not document MercadoPago vars

Only Stripe vars were listed.

**Fix:** `.env.example` now documents `MERCADOPAGO_ACCESS_TOKEN`,
`MERCADOPAGO_WEBHOOK_SECRET`, `COMPANY_NAME`, and `APP_LICENSE_TYPE`, with
inline notes on where to obtain them.

### F3 — Webhook did not verify the payment amount

A tampered or stale notification could create an order at a price different
from what the cart was quoted at.

**Fix (`webhook.endpoint.ts`):** before transitioning to `succeeded` on
`approved`, compare `paymentResponse.transaction_amount` with
`transaction.amount`. On mismatch, mark the transaction `failed`, log an
error, and refuse to create the order.

### F4 — Webhook returned non-2xx for "expected" conditions

MP retries any non-2xx every 15 min forever. Returning 401 for bad signatures
or 500 for unknown payments / missing `external_reference` / missing
transactions resulted in infinite retries for events that retries cannot fix.

**Fix:** signature failure, unknown payment, missing `external_reference`,
unknown transaction, and the duplicate-order-race result (409 in the util) all
return **2xx** with a `warn`/`info` log. Genuine transient failures (DB
transaction couldn't begin, unhandled throw in the outer handler) still
return 5xx so MP retries them.

### F5 — `data.id` not lowercased before going into the manifest

MP docs say `data.id` must be lowercased when alphanumeric. Payment IDs in
Checkout Pro are numeric, so the current code is safe in practice. Documented
as a known constraint to revisit if `merchant_order` handling is ever added.
No code change required today.

### F6 — Items array sent to MP was a single aggregate line

The old preference shipped one item with `title: 'Order'`,
`quantity: 1`, `unit_price: amount`. The MP dashboard and the payer's receipt
lost product detail.

**Fix (`initiate-payment.handler.ts`):** `preferenceItems` is now built from
the populated cart items. For each item we use:

- `id`: `${productId}` or `${productId}-${variantId}` when a variant exists.
- `title`: `product.title` plus `(variant.title)` when present.
- `unit_price`: variant price overrides product price when a variant exists —
  the same rule the cart's `beforeChangeCart` hook applies, so the totals
  match `cart.subtotal`.
- `currency_id`: uppercase currency from the cart.

Shipping is appended as a separate line (`id: 'shipping'`, `title: 'Envío'`)
when `shippingCost > 0`, so the sum of the preference items equals
`cart.subtotal + shippingCost = transaction.amount`.

### F7 — Cart snapshot was stored in MP `metadata`

The old flow JSON-stringified the cart items, the shipping address, and the
shipping cost into the MP preference `metadata` and read them back from
`paymentResponse.metadata` in the order-creation handler. MP's `metadata`
has per-key size limits and is a brittle source of truth.

**Fix:**

- `transactions.collection.ts` now adds two fields: `shippingAddress` (group,
  reuses the shared `addressFields` factory in
  `src/infrastructure/fields/address.field.ts` but with every subfield
  forced to `required: false` via `relaxAddressRequireds`) and `shippingCost`
  (sidebar, read-only number). The same `relaxBillingAddress` helper walks
  the plugin's default `tabs` structure and relaxes `billingAddress` to
  optional too. Both relaxations are intentional so admins can record
  manual ledger entries (wire transfers, manual receipts) without filling
  address data. The MP-driven path still validates and populates the full
  shipping address upstream in `initiate-payment.handler.ts`, and
  `create-order-from-payment.handler.ts` re-checks the required subfields
  (`name`, `addressLine1`, `city`, `country`) before promoting the snapshot
  into an Order — a ledger-only transaction can never accidentally produce
  a malformed Order.
- `initiate-payment.handler.ts` persists both on the Transaction during
  `payload.create({ collection: 'transactions', ... })`.
- `create-order-from-payment.handler.ts` reads `cartId`, `items`,
  `shippingAddress`, and `shippingCost` from the `transaction` arg. No more
  `paymentResponse.metadata.*` access.
- The `metadata` field is no longer set on the preference.

### F8 — Preferences had no expiration

The old preferences were valid indefinitely.

**Fix (`initiate-payment.handler.ts`):** every preference now sets
`expiration_date_from = now` and `expiration_date_to = now + 24h`
(ISO-8601). Constant: `PREFERENCE_TTL_MS`.

### F9 — Payer object only sent `email`

Anti-fraud and 3DS rules in Colombia rely on a richer payer object.

**Fix (`initiate-payment.handler.ts`):** payer is populated from the billing
address when available:

- `name` / `surname`: split on first whitespace from `billingAddress.name` via
  `splitName()` helper.
- `phone.number`: from `billingAddress.phone`.
- `address.street_name` + `address.zip_code`: from `billingAddress.addressLine1`
  and `billingAddress.postalCode`.

Identification fields (CC, NIT) are not captured by the existing address
shape, so they remain unset. Plug them in later if you add the field.

### F10 — No `statement_descriptor`

The charge appeared on cardholder statements with a generic MP descriptor.

**Fix (`initiate-payment.handler.ts`):** `buildStatementDescriptor()` reads
`COMPANY_NAME` from `process.env`, trims it, and truncates to 22 chars (the
MP limit). If unset, the descriptor is omitted.

### F11 — `confirmOrder` factory accepted unused `webhookSecret`

The factory signature took `webhookSecret` but never used it.

**Fix:** `confirm-order.handler.ts` factory now takes `{ accessToken }` only,
and `mercadopago.adapter.ts` calls `confirmOrder({ accessToken })`.

### F12 — `confirmOrder` trusted `payment_id` from the URL — **intentionally not fixed**

The browser is redirected back with `?payment_id=...` and the handler fetches
and returns the resulting order without checking that the calling session
owns the transaction. An attacker who somehow obtained another user's
`payment_id` could call `/api/payments/mercadopago/confirm-order` and receive
that user's `orderID` and `email`. They cannot charge the card, refund, or
authenticate as the user.

**Why we accept this:**

- Practical risk is low: MP `payment_id`s are long numeric, not enumerable;
  obtaining a victim's id requires URL/log leakage, not guessing.
- The fix considered (`data.cartID === transaction.cart` + customer match)
  would tie payment confirmation to cart state — a separate concern that
  will keep changing (clearing, merging, guest expiration, purchasedAt). Any
  drift in cart lifecycle would silently start rejecting *legitimate*
  customers on the most user-visible step of checkout.
- False positives at confirm-order are catastrophic; the leak prevented is
  email + order metadata. The tradeoff doesn't pay.

**When to revisit:** if the storefront starts selling anything where "user X
bought item Y" is itself sensitive, or if `/checkout/confirm-order` ever ships
third-party scripts that could leak the URL. The better fix in that case is
probably to not return `email` on the response and let `/orders/{orderID}`
enforce its own access control independently — that decouples
confirm-order from cart lifecycle.

### F13 — Public liveness GET probe

`webhook.endpoint.ts` exposed a public GET on `/webhooks` returning
`'Mercado Pago webhook endpoint is active'`. Low risk but unnecessary surface
that advertises the provider.

**Fix:** `webhookGetEndpoint` removed. Only the POST endpoint is registered.

### F14 — Empty-string fallbacks for `init_point` / `sandbox_init_point`

Returning `''` for missing init points let `window.location.href = ''` fail
silently when paired with `??` on the frontend.

**Fix (`initiate-payment.handler.ts`):** the existing guard at
`!preference.id || (!preference.init_point && !preference.sandbox_init_point)`
throws first. The return value now propagates `undefined` for the missing
url, so the frontend's `paymentData?.init_point ?? paymentData?.sandbox_init_point`
chain works correctly.

### F15 — `binary_mode` decision not documented

MP's `binary_mode` toggles the `in_process` state. With PSE/Efecty in
Colombia, payments stay `in_process` until the bank confirms, so binary mode
must be **off**.

**Fix (`initiate-payment.handler.ts`):** `binary_mode: false` is now explicit
in the preference body with a one-line comment explaining the reason.

### F16 — No idempotency key on `Preference.create`

Network retries to MP could create duplicate preferences for the same
transaction.

**Fix (`initiate-payment.handler.ts`):** `Preference.create` is called with
`requestOptions: { idempotencyKey: \`transaction-${transaction.id}\` }`. MP
de-duplicates per `(access token, idempotency key)`.

---

## Files touched

- `.env.example`
- `src/infrastructure/fields/address.field.ts` — `addressFields` factory
  relocated here from the shipping module so multiple modules can reuse it
  without crossing module boundaries (see `CLAUDE.md` principle 5).
- `src/infrastructure/plugins/plugins.config.ts` — imports `addressFields`
  from its new infrastructure location.
- `src/modules/shipping/collections/addresses/addresses.collection.ts` —
  now imports `addressFields` from infrastructure instead of declaring it.
- `src/modules/orders/collections/transactions.collection.ts`
- `src/modules/checkout/payment-methods/mercadopago/mercadopago.adapter.ts`
- `src/modules/checkout/payment-methods/mercadopago/initiate-payment.handler.ts`
- `src/modules/checkout/payment-methods/mercadopago/confirm-order.handler.ts`
- `src/modules/checkout/payment-methods/mercadopago/webhook.endpoint.ts`
- `src/modules/checkout/payment-methods/mercadopago/create-order-from-payment.handler.ts`
- `src/payload-types.ts` (regenerated by `pnpm generate:types`)

---

## Verification checklist

- `pnpm generate:types` — Transaction type now exposes required
  `shippingAddress` and optional `shippingCost`.
- `pnpm tsc --noEmit` — clean (the pre-existing TS1261 casing warnings in
  `src/modules/bookings/` are unrelated to this work).
- `pnpm lint` — no new warnings on the touched files.

**End-to-end sandbox flow (manual):**

1. Configure sandbox `MERCADOPAGO_ACCESS_TOKEN` + `MERCADOPAGO_WEBHOOK_SECRET`.
2. Run `pnpm dev`.
3. Complete a sandbox checkout. Confirm:
   - Transaction created with `status='pending'`, `shippingAddress` and
     `shippingCost` populated, `mercadopago.preferenceId` set after MP responds.
   - Webhook arrives, signature validates, Transaction flips to `succeeded`,
     Order created with `status='processing'`, Cart marked `purchasedAt`.
   - `/checkout/confirm-order?payment_id=...` returns the same order
     (idempotency).
   - Replaying the webhook returns the "Already processed" branch with 200.
4. **Amount-tampering test (F3):** lower the Transaction's `amount` in the
   DB, replay the webhook with the real (higher) approved payment, and
   confirm the Transaction is marked `failed`.
5. **Signature-failure test (F4):** POST a forged signature to the webhook.
   Expect HTTP 200 with `success: false`, a `warn` log, and no MP retry.

---

## Known follow-ups (not addressed, opportunistic)

- **MP `data.id` lowercasing (F5).** Today the code only handles
  `type === 'payment'` events (numeric IDs), so the manifest is correct. If
  you start handling `merchant_order` or other alphanumeric resources, call
  `dataId.toLowerCase()` when building the manifest.
- **`payer.identification`.** MP appreciates a national ID for fraud scoring
  in Colombia. Capture it on the billing address and add to
  `splitName()`-adjacent logic.
- **`payer.address.street_number`.** Currently bundled into `addressLine1`.
  If you split house number into its own field, populate `street_number`.
- **Existing pending Transactions.** Any transaction created before F7 has no
  `shippingAddress` and will fail in `create-order-from-payment`. In
  production, expire stale pending transactions before deploying.
