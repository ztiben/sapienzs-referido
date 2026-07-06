import { MercadoPagoConfig, Preference } from 'mercadopago'
import type { Items } from 'mercadopago/dist/clients/commonTypes'

import { City, Product, Variant } from '@/payload-types'
import { getPriceField } from '@/shared/bl/currency.bl'
import { TRANSACTIONS_SLUG } from '@/shared/constants/transactions.constants'
import { getServerSideURL } from '@/shared/utils/get-url.util'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

const PREFERENCE_TTL_MS = 24 * 60 * 60 * 1000

const splitName = (fullName?: string | null): { first?: string; last?: string } => {
  if (!fullName) return {}
  const trimmed = fullName.trim()
  if (!trimmed) return {}
  const [first, ...rest] = trimmed.split(/\s+/)
  return { first, last: rest.length > 0 ? rest.join(' ') : undefined }
}

const buildStatementDescriptor = (): string | undefined => {
  const raw = process.env.COMPANY_NAME?.trim()
  if (!raw) return undefined
  return raw.slice(0, 22)
}

export const initiatePayment =
  (props: {
    accessToken: string
    webhookSecret: string
  }): NonNullable<PaymentAdapter>['initiatePayment'] =>
  async ({ data, req, transactionsSlug = TRANSACTIONS_SLUG }) => {
    const payload = req.payload
    const { accessToken, webhookSecret } = props || {}
    const serverURL = getServerSideURL()
    const isHttps = serverURL.startsWith('https://')

    const customerEmail = data.customerEmail
    const currency = data.currency
    const cart = data.cart
    const billingAddressFromData = data.billingAddress
    const shippingAddressFromData = data.shippingAddress

    if (!accessToken) throw new Error('Mercado Pago access token is required.')
    if (!webhookSecret) throw new Error('Mercado Pago webhook secret is required.')
    if (!currency) throw new Error('Currency is required.')
    if (!cart || !cart.items || cart.items.length === 0)
      throw new Error('Cart is empty or not provided.')
    if (!customerEmail || typeof customerEmail !== 'string')
      throw new Error('A valid customer email is required to make a purchase.')
    if (!cart.subtotal || typeof cart.subtotal !== 'number' || cart.subtotal <= 0)
      throw new Error('A valid amount is required to initiate a payment.')

    const shippingCountry = shippingAddressFromData?.country
    const shippingCity = shippingAddressFromData?.city
    if (!shippingCountry)
      throw new Error('A shipping country is required to calculate shipping cost.')
    if (!shippingCity) throw new Error('A shipping city is required to calculate shipping cost.')

    const cityPriceField = getPriceField<City>(currency)
    const productPriceField = getPriceField<Product>(currency)
    const variantPriceField = getPriceField<Variant>(currency)

    const countriesResult = await payload.find({
      collection: 'countries',
      where: { name: { equals: shippingCountry } },
      limit: 1,
      req,
    })
    if (countriesResult.totalDocs === 0)
      throw new Error('Shipping to the specified country is not supported.')

    const country = countriesResult.docs[0]

    const citiesResult = await payload.find({
      collection: 'cities',
      where: {
        and: [{ name: { equals: shippingCity } }, { country: { equals: country.id } }],
      },
      limit: 1,
      req,
    })
    if (citiesResult.totalDocs === 0)
      throw new Error('Shipping to the specified city is not supported.')

    const city = citiesResult.docs[0]
    const shippingCost = (city[cityPriceField] ?? 0) as number

    const amount = cart.subtotal + shippingCost
    const currencyCode = currency.toUpperCase()

    const flattenedCart = cart.items.map((item) => {
      const productID = typeof item.product === 'object' ? item.product.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant.id
          : item.variant
        : undefined
      const { product: _product, variant: _variant, id: _id, ...customProperties } = item
      return {
        ...customProperties,
        product: productID,
        quantity: item.quantity,
        ...(variantID ? { variant: variantID } : {}),
      }
    })

    // Build a per-item array for the MP preference so the dashboard, the
    // payer's receipt, and reconciliation show product detail instead of a
    // single aggregated "Order" line. Unit prices come from the populated
    // product/variant (cart was loaded with depth: 2 by the plugin endpoint),
    // mirroring the plugin's own subtotal hook: variant price overrides
    // product price when a variant is selected.
    const preferenceItems: Items[] = cart.items.map((item) => {
      const product = typeof item.product === 'object' ? item.product : undefined
      const variant = typeof item.variant === 'object' ? item.variant : undefined
      const unitPrice = variant
        ? ((variant[variantPriceField] ?? 0) as number)
        : ((product?.[productPriceField] ?? 0) as number)
      const productId = product?.id ?? (typeof item.product === 'number' ? item.product : 0)
      const variantId = variant?.id ?? (typeof item.variant === 'number' ? item.variant : undefined)
      const baseTitle = product?.title ?? `Producto #${productId}`
      const title = variant?.title ? `${baseTitle} (${variant.title})` : baseTitle
      return {
        id: variantId ? `${productId}-${variantId}` : String(productId),
        title,
        quantity: item.quantity,
        unit_price: unitPrice,
        currency_id: currencyCode,
      }
    })

    if (shippingCost > 0) {
      preferenceItems.push({
        id: 'shipping',
        title: 'Envío',
        quantity: 1,
        unit_price: shippingCost,
        currency_id: currencyCode,
      })
    }

    let transaction
    try {
      transaction = await payload.create({
        collection: transactionsSlug as typeof TRANSACTIONS_SLUG,
        data: {
          ...(req.user ? { customer: req.user.id } : {}),
          customerEmail,
          amount,
          billingAddress: billingAddressFromData,
          shippingAddress: shippingAddressFromData,
          shippingCost,
          cart: cart.id,
          currency: currencyCode as 'COP',
          items: flattenedCart,
          paymentMethod: 'mercadopago',
          status: 'pending',
        },
        req,
      })

      const client = new MercadoPagoConfig({ accessToken })
      const mpPreference = new Preference(client)

      const { first: payerFirst, last: payerLast } = splitName(billingAddressFromData?.name)
      const payerPhone = billingAddressFromData?.phone
      const statementDescriptor = buildStatementDescriptor()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + PREFERENCE_TTL_MS)

      const preference = await mpPreference.create({
        body: {
          items: preferenceItems,
          payer: {
            email: customerEmail,
            ...(payerFirst ? { name: payerFirst } : {}),
            ...(payerLast ? { surname: payerLast } : {}),
            ...(payerPhone ? { phone: { number: payerPhone } } : {}),
            ...(billingAddressFromData
              ? {
                  address: {
                    street_name: billingAddressFromData.addressLine1 ?? undefined,
                    zip_code: billingAddressFromData.postalCode ?? undefined,
                  },
                }
              : {}),
          },
          back_urls: {
            success: `${serverURL}/checkout/confirm-order`,
            pending: `${serverURL}/checkout/confirm-order`,
            failure: `${serverURL}/checkout`,
          },
          // auto_return requires back_urls.success to be HTTPS; skip on localhost.
          ...(isHttps ? { auto_return: 'approved' } : {}),
          notification_url: `${serverURL}/api/payments/mercadopago/webhooks`,
          external_reference: String(transaction.id),
          expiration_date_from: now.toISOString(),
          expiration_date_to: expiresAt.toISOString(),
          // binary_mode=false lets PSE/Efecty payments stay in 'in_process'
          // until the bank confirms, which is the correct behavior for CO.
          binary_mode: false,
          ...(statementDescriptor ? { statement_descriptor: statementDescriptor } : {}),
        },
      })

      if (!preference.id || (!preference.init_point && !preference.sandbox_init_point)) {
        throw new Error('Failed to create payment preference with Mercado Pago.')
      }

      console.log('zorito', preference.id)

      await payload.update({
        collection: transactionsSlug as typeof TRANSACTIONS_SLUG,
        id: transaction.id,
        data: {
          mercadopago: {
            preferenceId: preference.id,
          },
        },
        req,
      })

      return {
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        preferenceId: preference.id,
        message: 'Payment initiated successfully',
      }
    } catch (error) {
      if (transaction?.id) {
        await payload.delete({
          collection: transactionsSlug as typeof TRANSACTIONS_SLUG,
          id: transaction.id,
          req,
        })
      }

      payload.logger.error({ err: error, msg: 'Error initiating payment with Mercado Pago' })
      throw new Error(error instanceof Error ? error.message : 'Unknown error initiating payment.')
    }
  }
