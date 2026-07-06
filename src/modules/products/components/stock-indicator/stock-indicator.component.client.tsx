'use client'
import type { Product } from '@/payload-types'

import { useTranslations } from 'next-intl'
import React from 'react'

import { useStockIndicator } from './use-stock-indicator'

type Props = {
  product: Product
}

export const StockIndicator: React.FC<Props> = ({ product }) => {
  const t = useTranslations('product')
  const { hidden, stockQuantity } = useStockIndicator(product)

  if (hidden) return null

  return (
    <div className="uppercase text-sm font-medium text-gray-500">
      {stockQuantity < 10 && stockQuantity > 0 && (
        <p>{t('onlyLeftInStock', { count: stockQuantity })}</p>
      )}
      {(stockQuantity === 0 || !stockQuantity) && <p>{t('outOfStock')}</p>}
    </div>
  )
}
