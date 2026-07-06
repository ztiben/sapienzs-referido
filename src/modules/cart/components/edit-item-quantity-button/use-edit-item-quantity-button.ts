import { type CartItem } from '@/modules/cart/bl/cart-item-display.bl'
import { isQuantityChangeDisabled } from '@/modules/cart/bl/edit-item-quantity.bl'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

export const useEditItemQuantityButton = (item: CartItem, type: 'minus' | 'plus') => {
  const { decrementItem, incrementItem, isLoading } = useCart()

  const disabled = isQuantityChangeDisabled(item, type)

  const onChange = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!item.id) return
    if (type === 'plus') {
      incrementItem(item.id)
    } else {
      decrementItem(item.id)
    }
  }

  return { disabled, isLoading, onChange }
}
