'use client'

import type { Product } from '@/payload-types'

import { StockIndicator } from '@/modules/products/components/stock-indicator/stock-indicator.component.client'
import { AddToCart } from '@/shared/components/add-to-cart/add-to-cart.component.client'
import { Price } from '@/shared/components/price/price.component'
import { RichText } from '@/shared/components/rich-text/rich-text.component'
import { WhatsAppButton } from '@/shared/components/whatsapp-button/whatsapp-button.component'
import React, { Suspense } from 'react'

import { VariantSelector } from '../variant-selector/variant-selector.component.client'
import { useProductDescription } from './use-product-description'

type Props = {
  product: Product
  whatsAppNumber?: string | null
}

export const ProductDescription: React.FC<Props> = ({ product, whatsAppNumber }) => {
  const { hasVariants, amount, lowestAmount, highestAmount } = useProductDescription(product)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-medium">{product.title}</h1>
        <div className="uppercase">
          {hasVariants ? (
            <Price
              highestAmount={highestAmount}
              lowestAmount={lowestAmount}
              className="font-bold"
            />
          ) : (
            <Price amount={amount} className="font-bold" />
          )}
        </div>
      </div>
      {product.description ? (
        <RichText className="w-full" data={product.description} enableGutter={false} />
      ) : null}
      <hr />
      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>

          <hr />
        </>
      )}
      {product.redirectToWhatsApp && whatsAppNumber ? (
        <WhatsAppButton itemName={product.title} whatsAppNumber={whatsAppNumber} type="product" />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Suspense fallback={null}>
              <StockIndicator product={product} />
            </Suspense>
          </div>

          <div className="flex items-center justify-between">
            <Suspense fallback={null}>
              <AddToCart product={product} />
            </Suspense>
          </div>
        </>
      )}
    </div>
  )
}
