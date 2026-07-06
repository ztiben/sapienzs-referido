import type { Address, Media, Product, Variant, VariantOption } from '@/payload-types'
import type { SupportedCountry } from '@/shared/models/supported-country.model'

export type PaymentMethod = 'mercadopago' | 'whatsapp'

export type CartItem = {
  product?: Product | null | number
  variant?: number | Variant | null
  quantity?: null | number
}

export type CartItemDisplay = {
  title: string
  image: Media | null | number | string | undefined
  price: null | number | undefined
  quantity: number
  variantOptionsLabel: string | undefined
}

export const getEnabledMethods = ({
  mercadoPagoEnabled,
  whatsAppEnabled,
  whatsAppNumber,
}: {
  mercadoPagoEnabled: boolean
  whatsAppEnabled: boolean
  whatsAppNumber?: string
}): PaymentMethod[] => [
  ...(mercadoPagoEnabled ? (['mercadopago'] as PaymentMethod[]) : []),
  ...(whatsAppEnabled && whatsAppNumber ? (['whatsapp'] as PaymentMethod[]) : []),
]

export const getShippingCost = (
  countries: SupportedCountry[],
  address: Partial<Address> | undefined,
): number | undefined => {
  const countryName = address?.country
  const cityName = address?.city
  if (!countryName || !cityName) return undefined
  const country = countries.find((c) => c.value === countryName)
  return country?.cities.find((c) => c.value === cityName)?.shippingCost
}

export const isCartEmpty = (cart: { items?: unknown[] | null } | null | undefined): boolean =>
  !cart || !cart.items || !cart.items.length

export const canGoToPayment = ({
  hasEmailOrUser,
  billingAddress,
  billingAddressSameAsShipping,
  shippingAddress,
  paymentMethod,
}: {
  hasEmailOrUser: boolean
  billingAddress: Partial<Address> | undefined
  billingAddressSameAsShipping: boolean
  shippingAddress: Partial<Address> | undefined
  paymentMethod: PaymentMethod | undefined
}): boolean =>
  Boolean(
    hasEmailOrUser &&
      billingAddress &&
      (billingAddressSameAsShipping || shippingAddress) &&
      paymentMethod,
  )

export const formatAddressLine = (addr: Partial<Address> | undefined): string => {
  if (!addr) return ''
  return [addr.addressLine1, addr.city, addr.state, addr.country, addr.postalCode]
    .filter(Boolean)
    .join(', ')
}

export type WhatsAppLabels = {
  hello: string
  cartId: string
  customer: string
  email: string
  addressBoth: string
  billingAddress: string
  shippingAddress: string
}

export const buildWhatsAppHref = ({
  whatsAppNumber,
  customerEmail,
  items,
  billingAddress,
  shippingAddress,
  billingAddressSameAsShipping,
  labels,
}: {
  whatsAppNumber: string | undefined
  customerEmail: string
  items: CartItem[]
  billingAddress: Partial<Address> | undefined
  shippingAddress: Partial<Address> | undefined
  billingAddressSameAsShipping: boolean
  labels: WhatsAppLabels
}): string => {
  if (!whatsAppNumber) return ''

  const itemLines = items
    .map((item) => {
      if (typeof item.product !== 'object' || !item.product) return null
      const name = item.product.title ?? ''
      const qty = item.quantity ?? 1
      return `- ${name} x${qty}`
    })
    .filter(Boolean)
    .join('\n')

  const billAddr = formatAddressLine(billingAddress)
  const shipAddr = billingAddressSameAsShipping ? null : formatAddressLine(shippingAddress)

  const addressSection = billingAddressSameAsShipping
    ? `${labels.addressBoth}: ${billAddr}`
    : `${labels.billingAddress}: ${billAddr}\n${labels.shippingAddress}: ${shipAddr}`

  const message = [
    labels.hello,
    ``,
    `*${labels.cartId}*`,
    itemLines,
    ``,
    `*${labels.customer}*`,
    `${labels.email}: ${customerEmail}`,
    addressSection,
  ]
    .filter((line) => line !== null)
    .join('\n')

  return `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`
}

export const resolveCartItemDisplay = (
  item: CartItem,
  priceField: keyof Product,
  variantPriceField: keyof Variant,
): CartItemDisplay | null => {
  if (typeof item.product !== 'object' || !item.product) return null

  const { product, quantity, variant } = item
  if (!quantity) return null

  let image: Media | null | number | string | undefined =
    product.gallery?.[0]?.image || product.meta?.image
  let price = product[priceField] as null | number | undefined

  const isVariant = Boolean(variant) && typeof variant === 'object'

  if (isVariant && typeof variant === 'object' && variant) {
    price = variant[variantPriceField] as null | number | undefined

    const imageVariant = product.gallery?.find((g: NonNullable<Product['gallery']>[number]) => {
      if (!g.variantOption) return false
      const variantOptionID =
        typeof g.variantOption === 'object' ? g.variantOption.id : g.variantOption
      return variant.options?.some((option: number | VariantOption) =>
        typeof option === 'object' ? option.id === variantOptionID : option === variantOptionID,
      )
    })

    if (imageVariant && typeof imageVariant.image !== 'string') {
      image = imageVariant.image
    }
  }

  const variantOptionsLabel =
    variant && typeof variant === 'object'
      ? variant.options
          ?.map((option: number | VariantOption) =>
            typeof option === 'object' ? option.label : null,
          )
          .filter(Boolean)
          .join(', ')
      : undefined

  return {
    title: product.title ?? '',
    image,
    price,
    quantity,
    variantOptionsLabel: variantOptionsLabel || undefined,
  }
}
