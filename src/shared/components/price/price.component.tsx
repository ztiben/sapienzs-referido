'use client'
import { formatPrice } from '@/shared/bl/currency.bl'
import React from 'react'

import { usePrice } from './use-price'

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
}

type PriceFixed = {
  amount?: number | null
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  currencyCode?: string
  highestAmount?: number | null
  lowestAmount?: number | null
}

type Props = BaseProps & (PriceFixed | PriceRange)

export const Price = ({
  amount,
  className,
  highestAmount,
  lowestAmount,
  currencyCode: currencyCodeFromProps,
  as = 'p',
}: Props & React.ComponentProps<'p'>) => {
  const { currencyCode } = usePrice(currencyCodeFromProps)

  const Element = as

  if (typeof amount === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {formatPrice(amount, currencyCode)}
      </Element>
    )
  }

  if (highestAmount && highestAmount !== lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatPrice(lowestAmount, currencyCode)} ${formatPrice(lowestAmount, currencyCode) && formatPrice(highestAmount, currencyCode) ? '-' : ''} ${formatPrice(highestAmount, currencyCode)}`}
      </Element>
    )
  }

  if (lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {formatPrice(lowestAmount, currencyCode)}
      </Element>
    )
  }

  return null
}
