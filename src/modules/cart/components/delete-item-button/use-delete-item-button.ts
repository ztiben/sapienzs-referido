import { type CartItem } from '@/modules/cart/bl/cart-item-display.bl'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

export const useDeleteItemButton = (item: CartItem) => {
  const { isLoading, removeItem } = useCart()
  const itemId = item.id

  const onDelete = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (itemId) removeItem(itemId)
  }

  return { disabled: !itemId || isLoading, onDelete }
}
