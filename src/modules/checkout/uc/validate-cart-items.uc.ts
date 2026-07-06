import type { Cart, Transaction } from '@/payload-types'
import { ValidationError, type CollectionBeforeChangeHook } from 'payload'
import { validateCartItem } from '../bl/validate-cart-item.bl'

type DocWithItems = Cart | Transaction

export const validateCartItemsBeforeChange: CollectionBeforeChangeHook<DocWithItems> = async ({
  data,
  originalDoc,
  req,
}) => {
  const items = data?.items ?? originalDoc?.items
  if (!Array.isArray(items) || items.length === 0) return data

  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    const productId = typeof item.product === 'object' ? item.product?.id : item.product
    const variantId = typeof item.variant === 'object' ? item.variant?.id : item.variant
    const quantity = item.quantity ?? 1

    if (!productId) continue

    const product = await req.payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
      req,
      select: {
        id: true,
        redirectToWhatsApp: true,
        infiniteInventory: true,
        inventory: true,
      },
    })

    let variant = null
    if (variantId) {
      variant = await req.payload.findByID({
        collection: 'variants',
        id: variantId,
        depth: 0,
        req,
        select: {
          id: true,
          infiniteInventory: true,
          inventory: true,
        },
      })
    }

    try {
      validateCartItem({ product, variant, quantity })
    } catch (error) {
      // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
      let message = req.t('custom:errorUnknown')

      if (error instanceof Error && error.cause === 'invalid') {
        message = product.redirectToWhatsApp
          ? // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
            req.t('custom:cartItemWhatsAppOnly')
          : // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
            req.t('custom:cartItemOutOfStock')
      }

      throw new ValidationError({
        errors: [{ path: `items.${index}.product`, message }],
      })
    }
  }

  return data
}
