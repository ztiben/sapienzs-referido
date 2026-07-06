import clsx from 'clsx'
import React from 'react'

import type { SupportedCurrency } from '@/shared/bl/format-price.bl'
import { Price } from '@/shared/components/price/price.component'

type Props = {
  amount?: number
  currencyCode?: SupportedCurrency
  position?: 'bottom' | 'center'
  title: string
}

export const Label: React.FC<Props> = ({ amount, currencyCode, position = 'bottom', title }) => {
  return (
    <div
      className={clsx('absolute bottom-0 left-0 flex w-full px-4 pb-4 @container/label', {
        '': position === 'center',
      })}
    >
      <div className="flex items-end justify-between text-sm grow font-semibold ">
        <h3 className="mr-4 line-clamp-2 border p-2 px-3 leading-none tracking-tight rounded-full backdrop-blur-md">
          {title}
        </h3>

        <Price
          amount={amount}
          currencyCode={currencyCode}
          className="flex-none rounded-full bg-neutral p-2 text-neutral-content"
        />
      </div>
    </div>
  )
}
