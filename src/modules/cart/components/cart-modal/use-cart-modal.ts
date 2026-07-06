import type { Product, Variant } from '@/payload-types'

import { resolveCartModalItem } from '@/modules/cart/bl/cart-item-display.bl'
import { getPriceField } from '@/shared/bl/currency.bl'
import { useCart, useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useCartModal = () => {
  const { cart } = useCart()
  const { currency } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const priceField = getPriceField<Product>(currency.code)
  const variantPriceField = getPriceField<Variant>(currency.code)

  useEffect(() => {
    // Close the cart modal when the pathname changes.
    setIsOpen(false)
  }, [pathname])

  const items = cart?.items ?? []
  const cartEmpty = !cart || items.length === 0

  const totalQuantity = cartEmpty
    ? undefined
    : items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)

  const resolvedItems = items.map((item) =>
    resolveCartModalItem(item, priceField, variantPriceField),
  )

  return {
    isOpen,
    setIsOpen,
    cartEmpty,
    resolvedItems,
    subtotal: cart?.subtotal,
    totalQuantity,
  }
}
