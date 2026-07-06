import type { Media, Product, Service, Variant } from '@/payload-types'
import { getPriceField } from '@/shared/bl/currency.bl'

export type DisplayItem = {
  title: string
  slug: string
  collection: 'products' | 'services'
  image?: Media | number | null
  price?: number
  enableVariants?: boolean | null
  variants?: Product['variants']
}

const priceField = getPriceField<Product>()
const variantPriceField = getPriceField<Variant>()

export function toDisplayItem(
  doc: Product | Service,
  collection: 'products' | 'services',
): DisplayItem {
  let price = ((doc as unknown as Record<string, unknown>)[priceField as string] as number | undefined) || undefined

  if (collection === 'products') {
    const product = doc as Product
    if (product.enableVariants && product.variants?.docs?.length) {
      const variant = product.variants.docs[0]
      if (variant && typeof variant === 'object' && variant[variantPriceField]) {
        price = variant[variantPriceField] as number
      }
    }
  }

  const image =
    collection === 'products'
      ? (doc as Product).gallery?.[0]?.image
      : (doc as Service).images?.[0]

  return {
    title: doc.title,
    slug: doc.slug,
    collection,
    image: image ?? null,
    price,
    enableVariants: collection === 'products' ? (doc as Product).enableVariants : false,
    variants: collection === 'products' ? (doc as Product).variants : undefined,
  }
}
