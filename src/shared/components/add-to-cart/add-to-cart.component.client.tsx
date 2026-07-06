'use client'

import type { Product } from '@/payload-types'

import { Button } from '@/shared/components/ui/button'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import React from 'react'

import { useAddToCart } from './use-add-to-cart'

type Props = {
  product: Product
}

export const AddToCart: React.FC<Props> = ({ product }) => {
  const t = useTranslations('product')
  const { disabled, isLoading, onAddToCart } = useAddToCart(product)

  return (
    <Button
      aria-label="Add to cart"
      className={clsx({
        'hover:opacity-90': true,
      })}
      disabled={disabled || isLoading}
      onClick={onAddToCart}
      type="submit"
    >
      {t('addToCart')}
    </Button>
  )
}
