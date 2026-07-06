import type { Product, Variant } from '@/payload-types'

type Params = {
  product: Pick<Product, 'id' | 'redirectToWhatsApp' | 'infiniteInventory' | 'inventory'>
  variant?: Pick<Variant, 'id' | 'infiniteInventory' | 'inventory'> | null
  quantity: number
}

export const validateCartItem = ({ product, variant, quantity }: Params): void => {
  if (product.redirectToWhatsApp) {
    throw new Error(undefined, { cause: 'invalid' })
  }

  if (variant) {
    if (variant.infiniteInventory) return
    if (variant.inventory === 0 || (variant.inventory != null && variant.inventory < quantity)) {
      throw new Error(undefined, { cause: 'invalid' })
    }
    return
  }

  if (product.infiniteInventory) return
  if (product.inventory === 0 || (product.inventory != null && product.inventory < quantity)) {
    throw new Error(undefined, { cause: 'invalid' })
  }
}
