import type { Product, Variant } from '@/payload-types'

import { resolveCartItemDisplay, type CartItem } from '@/modules/checkout/bl/checkout.bl'
import { Media } from '@/shared/components/media/media.component'
import { Message } from '@/shared/components/message/message.component'
import { Price } from '@/shared/components/price/price.component'
import { Button } from '@/shared/components/ui/button'
import { useTranslations } from 'next-intl'
import React from 'react'

type CartLike = {
  id?: number | string
  items?: CartItem[] | null
  subtotal?: null | number
}

type Props = {
  cart: CartLike | null | undefined
  priceField: keyof Product
  variantPriceField: keyof Variant
  shippingCost: number | undefined
  canPay: boolean
  error: null | string
  onFinalize: (e: React.MouseEvent) => void
  onClearError: () => void
}

export const CartSummary: React.FC<Props> = ({
  cart,
  priceField,
  variantPriceField,
  shippingCost,
  canPay,
  error,
  onFinalize,
  onClearError,
}) => {
  const t = useTranslations('checkout')
  const items = (cart?.items ?? []) as CartItem[]

  return (
    <div className="basis-full lg:basis-1/3 lg:pl-8 p-8 border-none bg-base-200 flex flex-col gap-8 rounded-lg">
      <h2 className="text-3xl font-medium">{t('yourCart')}</h2>
      {items.map((item, index) => {
        const display = resolveCartItemDisplay(item, priceField, variantPriceField)
        if (!display) return null

        const { title, image, price, quantity, variantOptionsLabel } = display

        return (
          <div className="flex items-start gap-4" key={index}>
            <div className="flex items-stretch justify-stretch h-20 w-20 rounded-lg border">
              <div className="relative w-full h-full">
                {image && typeof image !== 'string' && (
                  <Media className="" fill imgClassName="rounded-lg" resource={image} />
                )}
              </div>
            </div>
            <div className="flex grow justify-between items-center">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-lg">{title}</p>
                {variantOptionsLabel && (
                  <p className="text-sm text-base-content/50 tracking-widest">
                    {variantOptionsLabel}
                  </p>
                )}
                <div>
                  {'x'}
                  {quantity}
                </div>
              </div>

              {typeof price === 'number' && <Price amount={price} />}
            </div>
          </div>
        )
      })}
      <hr />
      {shippingCost && (
        <div className="flex justify-between items-center gap-2">
          <span className="uppercase">{t('shipping')}</span>
          <Price amount={shippingCost} />
        </div>
      )}
      <div className="flex justify-between items-center gap-2">
        <span className="uppercase">{t('total')}</span>{' '}
        <Price
          className="text-3xl font-medium"
          amount={(cart?.subtotal ?? 0) + (shippingCost ?? 0)}
        />
      </div>
      <Button className="w-full" disabled={!canPay} onClick={onFinalize}>
        {t('finalizePurchase')}
      </Button>
      {error && (
        <div>
          <Message error={error} />
          <Button
            onClick={(e) => {
              e.preventDefault()
              onClearError()
            }}
            variant="default"
          >
            {t('tryAgain')}
          </Button>
        </div>
      )}
    </div>
  )
}
