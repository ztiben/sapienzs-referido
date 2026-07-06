import React from 'react'

import { formatPrice, type SupportedCurrency } from '@/shared/bl/format-price.bl'
import { cn } from '@/shared/utils/cn.util'

type Props = {
  amount?: number | null
  currencyCode?: SupportedCurrency
  className?: string
  as?: 'span' | 'p'
  /** Renders the price crossed out (for original prices next to a deal price). */
  strikethrough?: boolean
}

export const Price: React.FC<Props> = ({
  amount,
  currencyCode,
  className,
  as = 'p',
  strikethrough = false,
}) => {
  if (amount === undefined || amount === null) return null

  const Element = as

  return (
    <Element
      className={cn(strikethrough && 'line-through opacity-60', className)}
      suppressHydrationWarning
    >
      {formatPrice(amount, currencyCode)}
    </Element>
  )
}
