import type { Cart, Media, Product, Variant, VariantOption } from '@/payload-types'

export type CartItem = NonNullable<Cart['items']>[number]

export type CartModalItem = {
  item: CartItem
  product: Product
  slug: string
  image: Media | undefined
  price: null | number | undefined
  quantity: null | number | undefined
  variantOptionsLabel: null | string
  isVariant: boolean
}

/**
 * Pure: resolves a cart item into the data the cart modal renders (image,
 * price, variant label). Returns null for items that should not be shown.
 */
export const resolveCartModalItem = (
  item: CartItem,
  priceField: keyof Product,
  variantPriceField: keyof Variant,
): CartModalItem | null => {
  const product = item.product
  const variant = item.variant

  if (typeof product !== 'object' || !product || !product.slug) return null

  const metaImage =
    product.meta?.image && typeof product.meta.image === 'object' ? product.meta.image : undefined
  const firstGalleryImage =
    typeof product.gallery?.[0]?.image === 'object' ? product.gallery?.[0]?.image : undefined

  let image: Media | undefined = firstGalleryImage || metaImage
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

    if (imageVariant && typeof imageVariant.image === 'object') {
      image = imageVariant.image
    }
  }

  const variantOptionsLabel =
    isVariant && variant && typeof variant === 'object'
      ? variant.options
          ?.map((option: number | VariantOption) =>
            typeof option === 'object' ? option.label : null,
          )
          .join(', ') ?? null
      : null

  return {
    item,
    product,
    slug: product.slug,
    image,
    price,
    quantity: item.quantity,
    variantOptionsLabel,
    isVariant,
  }
}
