import type { Product, Variant } from '@/payload-types'

export const resolveSelectedVariant = (
  product: Product,
  variantId: null | string,
): Variant | undefined => {
  const variants = product.variants?.docs || []
  if (!product.enableVariants || !variants.length) return undefined

  const validVariant = variants.find((variant) =>
    typeof variant === 'object'
      ? String(variant.id) === variantId
      : String(variant) === variantId,
  )

  return validVariant && typeof validVariant === 'object' ? validVariant : undefined
}

export type StockInfo = {
  hidden: boolean
  stockQuantity: number
}

/**
 * Pure: derives whether the stock indicator should render and the remaining
 * stock quantity for the product/selected variant.
 */
export const getStockInfo = (
  product: Product,
  selectedVariant: Variant | undefined,
): StockInfo => {
  const isInfinite = product.enableVariants
    ? Boolean(selectedVariant?.infiniteInventory)
    : Boolean(product.infiniteInventory)

  const stockQuantity = product.enableVariants
    ? selectedVariant
      ? selectedVariant.inventory || 0
      : product.inventory || 0
    : product.inventory || 0

  const hidden = (product.enableVariants && !selectedVariant) || isInfinite

  return { hidden, stockQuantity }
}
