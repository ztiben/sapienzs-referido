# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the codebase of **Sapyenzs Referido**, a curated affiliate-deals website (similar in spirit to onlineatthelake.com): hand-picked discounts from retailers such as Amazon, Mercado Libre and Éxito are published with outbound referral links. Deals are curated manually through the Payload admin panel, with the data model prepared for future imports from retailer APIs (`sync.source`, `sync.externalId`, `sync.lastSyncedAt`). The storefront is bilingual (Spanish default, English) and is deployed to Vercel.

## Tech Stack

- [Payload](https://payloadcms.com/docs/getting-started/what-is-payload) (CMS / backend)
- [Next.js](https://nextjs.org/docs) + [React Compiler](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [tailwindcss](https://tailwindcss.com/)
- [pnpm](https://pnpm.io/motivation) (package manager)

## Architecture

This project uses a **modular architecture** where each module contains all the logic and components associated with a specific business feature, promoting decoupling, reusability, and scalability. It is based on [Modular Architecture for Scalable Frontend Development](https://dev.to/amirrezasalimi/modular-architecture-for-scalable-frontend-development-2emb), adapted to Payload + Next.js.

### Key Principles

1. **Kebab-case Naming Convention**: use `kebab-case` for all directories and files. Use an extension that indicates the file type when applicable: `admin-only-field.access.ts`, `media.collection.ts`, `footer.component.tsx`, `discount.bl.ts`, `validate-deal.uc.ts`, `deals.model.ts`, `format-price.bl.ts`.

2. **Encapsulate Components in Directories**: each component lives in its own directory, even if it contains a single file. This keeps them isolated and ready to grow.

3. **Feature-based Modules**: the project is organized by features (modules). Each module contains its own components, business logic, use cases, collections, etc.

4. **Shared Resources**: resources reusable by any module are centralized in [`src/shared/`](/src/shared/).

5. **Strict Module Boundaries**: a module may only access resources from `shared` or `infrastructure`. It must **never** reach into the internals of another module. `shared`/`infrastructure` must never import a module. When something is needed by ≥2 modules (or by `shared`/`infrastructure`), it must be relocated to `shared`/`infrastructure` — not imported across modules. Example: the deal card is consumed by both the `deals` module and the `pages` CMS blocks, so it lives in [`src/shared/components/deal-card/`](/src/shared/components/deal-card/).

   **Slot injection for layout shells.** Infrastructure layout components (header, footer) stay domain-agnostic: when they need a feature widget (e.g. the newsletter form in the footer), the app composition root injects it via a `ReactNode` slot prop — the shell never imports the module. See `newsletterSlot` in [`src/infrastructure/footer/components/footer/footer.component.tsx`](/src/infrastructure/footer/components/footer/footer.component.tsx), wired from [`src/app/(app)/layout.tsx`](/src/app/(app)/layout.tsx).

   **Exception — the composition roots.** Exactly two files (one per runtime) may import modules, because assembling independent modules into a running app is their entire job. They are pure, **unidirectional** dependency-injection sinks: they import modules, but no module ever imports them:
   - **Client composition root:** [`src/shared/providers/app.provider.tsx`](/src/shared/providers/app.provider.tsx) — wires the app-wide provider tree.
   - **Server composition root:** [`src/payload.config.ts`](/src/payload.config.ts) and the plugin manifest it delegates to ([`src/infrastructure/plugins/`](/src/infrastructure/plugins/)) — Payload structurally requires a single config that registers every module's collections/globals/plugins.

   Next.js App Router files ([`src/app/`](/src/app/)) are routing glue and may also import module components directly.

6. **Business Logic and Use Cases**: all business-rule logic is encapsulated in `*.bl.ts` files that contain **pure TypeScript functions** with no pnpm package dependencies — they depend only on their arguments, which are [Payload types](/src/payload-types.ts) or types defined in `*.model.ts` files. The `*.uc.ts` files (use cases) consume those functions and are the integration point with Payload and other side effects. Examples: [discount logic](/src/shared/bl/discount.bl.ts) and [deal validation use case](/src/modules/deals/uc/validate-deal.uc.ts).

### Patterns

#### Container / Presentational

Separate UI from logic in components with state (state, context, side-effects).

- `*.component.tsx` (presentational): receives props, instantiates the component's main hook, and renders JSX. It must **not** contain logic outside the main hook.
- `use-<component-name>.ts` (hook): state, effects, handlers.

Does not apply to: [design system](/src/shared/components/ui/) and Next.js [routing files](https://nextjs.org/docs/app/getting-started/project-structure#routing-files).

#### Business Logic / Use Case

```
bl/  → pure functions, no pnpm deps, testable in isolation
uc/  → orchestrate bl + Payload Local API + side effects
```

Payload collections and endpoints must delegate business rules to `bl/` through `uc/`, not implement them inline in hooks or handlers.

**`uc/` is not a universal wrapper for `bl/`.** A `uc/` is specifically the adapter for **one side-effect boundary: Payload (Local API) on the server**. The hard invariant is that a `bl/` stays pure (no side effects, no knowledge of Payload or React); side effects always live in whatever orchestrator fits the surface that consumes the `bl/`:

- **Server — Payload hooks/endpoints:** consume `bl/` through a `uc/` (mandatory, as above).
- **Client — components:** the component's own hook (`use-<component>.ts`) is the client-side orchestrator (data fetching via SWR, form state, `toast`, etc.) and consumes `bl/` **directly**. Do **not** create a `uc/` for this.
- **Other pure code:** may consume `bl/` directly (pure → pure).

**Error-signaling convention:** a `bl/` function signals a failed rule by throwing `new Error(undefined, { cause })` — no message, just a `cause` discriminator. `cause` is a **closed set of exactly two values**, shared by every `bl/` (do not invent rule-specific causes):

- `'incomplete'` — the data needed to evaluate the rule is missing or not yet available.
- `'invalid'` — the rule was evaluated and the document violates it.

A `bl/` never builds user-facing strings. The `uc/` wraps the `bl/` call in `try/catch`, maps `error.cause` to a message, and throws the Payload error appropriate to the surface:

- `ValidationError` when the rule guards an admin form field — the message **must** be translated via `req.t('custom:...')` because it renders in the admin UI. Example: [validate-deal.uc.ts](/src/modules/deals/uc/validate-deal.uc.ts).
- `APIError` when the rule guards an API-only path — a plain (non-translated) message is fine because it surfaces only in the network response, not the admin UI. Example: [subscribe.endpoint.ts](/src/modules/newsletter/collections/subscribers/endpoints/subscribe.endpoint.ts).

#### Client-side Data Fetching

All client-side requests **must** be made with [SWR](https://swr.vercel.app/) using a fetcher built on the native `fetch` API (no `axios` or other HTTP clients). The global configuration lives in [`src/infrastructure/swr/`](/src/infrastructure/swr/) and is applied through the app's provider tree. Do not call `fetch` directly inside components for data fetching — always go through `useSWR` (or `useSWRMutation`) so caching, deduplication, and revalidation behave consistently across the app.

#### Localization (two layers)

1. **Storefront UI strings** — [next-intl](https://next-intl.dev/) with locales `es` (default) and `en`, driven by the `NEXT_LOCALE` cookie ([`src/infrastructure/i18n/request.ts`](/src/infrastructure/i18n/request.ts)); messages live in [`messages/es.json`](/messages/es.json) and [`messages/en.json`](/messages/en.json).
2. **CMS content** — Payload localization is enabled (`localization: { locales: ['es','en'], defaultLocale: 'es', fallback: true }`). Localized fields: deal `title`/`description`, category `title`. **Every Local API/REST query for localized content must pass `locale`** (from `getLocale()` server-side); forgetting it silently serves the default locale.

#### Code Splitting

No component should exceed **300 lines**. If it exceeds that, split it into subcomponents.

#### Arrow Functions

Always prefer arrow functions when writing TypeScript functions.

#### No `useMemo` / `useCallback`

Do not use `useMemo` or `useCallback` in any component. The project uses [React Compiler](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler), which automatically memoizes components and values, making manual memoization unnecessary.

#### React Compiler + `react-hook-form` `formState`

Add the `'use no memo'` directive as the **first statement of the consuming component** when it reads a `formState` field that must update **on interaction** (`isDirty`, `isValid`, `dirtyFields`, `touchedFields`, or `errors` with live validation modes). Today only [account-form](/src/modules/account/components/account-form/account-form.component.client.tsx) qualifies (it reads `isDirty`). Keep the directive scoped to the specific component that needs it.

### Directory Structure

```
📂 src/
├── 📂 app/                      # Next.js App Router (route groups: (app), (payload))
│   └── (app)/                   # Storefront: / (coded home) · deals/ · deals/[slug] ·
│                                #   go/[dealId] (affiliate redirect) · (account)/ · auth pages · [slug] (CMS pages)
│
├── 📂 infrastructure/           # Low-level cross-cutting resources
│   ├── 📂 access/               # admin-only.access.ts · admin-or-user-owner.access.ts ...
│   ├── 📂 blocks/               # Reusable Payload block configs (content.config.ts)
│   ├── 📂 collections/          # Global collections (media.collection.ts)
│   ├── 📂 fields/               # Reusable field factories (link.field.ts)
│   ├── 📂 swr/                  # swr.fetcher.ts · swr.provider.client.tsx
│   ├── 📂 globals/              # configuration.global.ts (contact + social links)
│   ├── 📂 header/ · footer/     # Globals + layout components (slot-injected widgets)
│   ├── 📂 i18n/                 # request.ts (next-intl)
│   ├── 📂 plugins/              # plugins.config.ts (seo, form-builder, vercel-blob)
│   ├── 📂 scripts/              # seed-pages.script.ts · seed-retailers.script.ts
│   └── 📂 sonner/ · theme/      # Providers
│
├── 📂 modules/                  # Business features (strict boundaries)
│   ├── 📂 deals/                # Core: deals catalog with affiliate links
│   │   ├── 📂 bl/               # deal-status.bl.ts · affiliate-url.bl.ts (pure)
│   │   ├── 📂 uc/               # validate-deal.uc.ts · track-click.uc.ts · toggle-favorite.uc.ts
│   │   ├── 📂 endpoints/        # favorite.endpoint.ts (POST /api/deals/:id/favorite)
│   │   ├── 📂 collections/      # deals/ · categories/ · favorites/ · deal-reports/
│   │   └── 📂 components/       # deal-grid · deal-filters · featured-deals · retailer-section ·
│   │                            #   deal-detail · favorite-button · report-expired-button · favorites-listing
│   ├── 📂 retailers/            # Retailer catalog (affiliate link templates per store)
│   ├── 📂 newsletter/           # Subscribers + subscribe endpoint + form
│   ├── 📂 auth/ · account/      # Email-based auth, profile
│   └── 📂 pages/                # CMS-driven pages (blocks, live preview, system pages)
│
└── 📂 shared/                   # Reusable by any module
    ├── 📂 components/           # ui/ (shadcn) + deal-card · price · grid-tile-image · search · media · rich-text ...
    ├── 📂 providers/            # app.provider.tsx (client composition root) · auth.provider.client.tsx
    ├── 📂 bl/                   # discount.bl.ts · format-price.bl.ts (shared pure logic)
    ├── 📂 utils/                # to-display-item.util.ts · generate-meta.util.ts ...
    └── 📂 constants/ · models/
```

### Domain Model

- **`deals`** (drafts + autosave + live preview, localized title/description): `retailer` (rel), `category` (rel), `originalPrice`/`dealPrice`/`currency` (COP|USD), `affiliateUrl` (raw product URL), `startsAt`/`expiresAt`, `featured`, `clickCount` (admin-only, incremented by the `/go/[dealId]` redirect), and the `sync` group (`source: manual|api`, `externalId`, `lastSyncedAt`) reserved for the future API importer (upsert key: retailer + externalId).
- **`retailers`**: `affiliateTagTemplate` uses `{url}` as placeholder (e.g. `{url}?tag=sapyenzs-20`); applied at click time by [`affiliate-url.bl.ts`](/src/modules/deals/bl/affiliate-url.bl.ts) so tags can change without touching deals. Adding a retailer requires **no code** — it is a CMS row.
- **`favorites`**: one row per (user, deal); uniqueness enforced in a beforeValidate hook; owner-scoped access via `admin-or-user-owner.access.ts`.
- **`deal-reports`**: "report expired" flow; `user` is always forced from `req.user`; `status` moderated by admins.
- **`subscribers`**: newsletter signups via the public `POST /api/subscribers/subscribe` endpoint (idempotent upsert — never leaks whether an email exists). Single opt-in for now; double opt-in is a TODO tied to enabling `nodemailerAdapter`.

### Business Rules

- A deal's price must be lower than its original price (discount must be positive).
- A deal's expiration date must be after its start date.
- Outbound deal links always go through `/go/[dealId]` (302 redirect) so clicks are counted and the retailer's affiliate template is applied centrally; CTAs carry `rel="sponsored nofollow"`.
- Only published deals are publicly readable, redirectable, and listed.
- A favorite is unique per (user, deal) and only visible/deletable by its owner (or an admin).
- **Amazon Associates compliance**: the affiliate disclosure page (`/divulgacion-afiliados`) must exist and be linked in the footer.

### Design System

- Prefer reusable components from the design system over creating your own: [shadcn/ui](https://ui.shadcn.com/docs) for the storefront and [payloadcms/ui](https://github.com/payloadcms/payload/tree/main/packages/ui) for the admin panel.
- Prefer tailwindcss classes over CSS files for styling.

### Package Manager

This project uses **pnpm**. Always run scripts with `pnpm` or `pnpx`, never `npm` or `npx`.

## Commands

| Task | Command |
| --- | --- |
| Dev server | `pnpm dev` (Next.js + Payload at `http://localhost:3000`) |
| Production build | `pnpm build` |
| Lint | `pnpm lint` / `pnpm lint:fix` |
| Regenerate Payload types | `pnpm generate:types` (writes `src/payload-types.ts`) |
| Regenerate admin import map | `pnpm generate:importmap` |
| Integration tests | `pnpm test:int` (Vitest, jsdom, `tests/int/**/*.int.spec.ts`) |
| E2E tests | `pnpm test:e2e` (Playwright, `tests/e2e/`; auto-starts `pnpm dev`) |
| Full test suite | `pnpm test` (int then e2e) |
| Seed CMS pages | `pnpm seed:pages` (legal pages: affiliate disclosure, privacy, about) |
| Seed retailers | `pnpm seed:retailers` (Amazon, Mercado Libre, Éxito) |

The database is **Vercel Postgres / Neon** via `@payloadcms/db-vercel-postgres` (`POSTGRES_URL`); collection/relationship IDs are `number`, not `string`. Media storage is **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`). `pnpm dev`, `pnpm build`, the e2e suite and `tests/int/api.int.spec.ts` all require a reachable Postgres; the pure-`bl` integration tests do not.

## Code Validation

- Before validating TypeScript, regenerate Payload types: `pnpm generate:types`
- To validate TypeScript correctness after modifying code, run `pnpm exec tsc --noEmit`
- Regenerate the import map (`pnpm generate:importmap`) after creating or modifying admin components.
