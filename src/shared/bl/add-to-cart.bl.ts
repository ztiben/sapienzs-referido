import type { Cart, Product, Variant } from '@/payload-types'

type CartItem = NonNullable<Cart['items']>[number]

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

/**
 * Pure rule: whether the "add to cart" action must be disabled, based on the
 * selected variant, price availability, inventory, and what is already in the
 * cart.
 */
export const isAddToCartDisabled = ({
  product,
  selectedVariant,
  cartItems,
}: {
  product: Product
  selectedVariant: Variant | undefined
  cartItems: CartItem[] | null | undefined
}): boolean => {
  const existingItem = cartItems?.find((item) => {
    const productID = typeof item.product === 'object' ? item.product?.id : item.product
    const variantID = item.variant
      ? typeof item.variant === 'object'
        ? item.variant?.id
        : item.variant
      : undefined

    if (productID === product.id) {
      if (product.enableVariants) return variantID === selectedVariant?.id
      return true
    }
    return false
  })

  if (product.enableVariants) {
    if (!selectedVariant) return true
    if (selectedVariant.priceInCOP == null) return true
    if (selectedVariant.infiniteInventory) return false
    if (existingItem) return (existingItem.quantity ?? 0) >= (selectedVariant.inventory || 0)
    if (selectedVariant.inventory === 0) return true
  } else {
    if (product.priceInCOP == null) return true
    if (product.infiniteInventory) return false
    if (existingItem) return (existingItem.quantity ?? 0) >= (product.inventory || 0)
    if (product.inventory === 0) return true
  }

  return false
}
