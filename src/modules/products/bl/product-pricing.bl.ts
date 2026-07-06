import type { Product, Variant } from '@/payload-types'

export type DisplayPricing = {
  hasVariants: boolean
  amount?: null | number
  lowestAmount?: null | number
  highestAmount?: null | number
}

/**
 * Pure: computes the price(s) to display for a product — a single amount, or
 * the lowest/highest across its variants ordered by price.
 */
export const getDisplayPricing = (
  product: Product,
  productPriceField: keyof Product,
  variantPriceField: keyof Variant,
): DisplayPricing => {
  const hasVariants = Boolean(product.enableVariants && product.variants?.docs?.length)

  if (!hasVariants) {
    return { hasVariants, amount: product[productPriceField] as null | number | undefined }
  }

  const variantsOrderedByPrice = (product.variants?.docs
    ?.filter((variant) => variant && typeof variant === 'object')
    .sort((a, b) => {
      if (
        typeof a === 'object' &&
        typeof b === 'object' &&
        variantPriceField in a &&
        variantPriceField in b &&
        typeof a[variantPriceField] === 'number' &&
        typeof b[variantPriceField] === 'number'
      ) {
        return (a[variantPriceField] as number) - (b[variantPriceField] as number)
      }
      return 0
    }) || []) as Variant[]

  return {
    hasVariants,
    lowestAmount: variantsOrderedByPrice[0]?.[variantPriceField] as null | number | undefined,
    highestAmount: variantsOrderedByPrice[variantsOrderedByPrice.length - 1]?.[
      variantPriceField
    ] as null | number | undefined,
  }
}
