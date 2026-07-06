import type { Product } from '@/payload-types'

import { isAddToCartDisabled, resolveSelectedVariant } from '@/shared/bl/add-to-cart.bl'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export const useAddToCart = (product: Product) => {
  const { addItem, cart, isLoading } = useCart()
  const t = useTranslations('product')
  const searchParams = useSearchParams()

  const selectedVariant = resolveSelectedVariant(product, searchParams.get('variant'))

  const disabled = isAddToCartDisabled({
    product,
    selectedVariant,
    cartItems: cart?.items,
  })

  const onAddToCart = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    await addItem({
      product: product.id,
      variant: selectedVariant?.id ?? undefined,
    })
    toast.success(t('itemAdded'))
  }

  return { disabled, isLoading, onAddToCart }
}
