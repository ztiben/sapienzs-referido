import type { CartItem } from '@/modules/cart/bl/cart-item-display.bl'

/**
 * Pure rule: whether a quantity change is disabled — `plus` is blocked once the
 * cart quantity reaches the (finite) inventory of the variant/product.
 */
export const isQuantityChangeDisabled = (
  item: CartItem,
  type: 'minus' | 'plus',
): boolean => {
  if (!item.id) return true

  const target =
    item.variant && typeof item.variant === 'object'
      ? item.variant
      : item.product && typeof item.product === 'object'
        ? item.product
        : null

  if (target && typeof target === 'object') {
    if (target.infiniteInventory) return false

    if (target.inventory !== undefined && target.inventory !== null) {
      if (type === 'plus' && item.quantity !== undefined && item.quantity !== null) {
        return item.quantity >= target.inventory
      }
    }
  }

  return false
}
