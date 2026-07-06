import type { Media as MediaType } from '@/payload-types'
import type { DisplayItem } from '@/shared/utils/to-display-item.util'

import { computeDiscountPercent } from '@/shared/bl/discount.bl'
import { Media } from '@/shared/components/media/media.component'
import { Price } from '@/shared/components/price/price.component'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'

type Props = {
  item: DisplayItem
}

const safeDiscountPercent = (item: DisplayItem): number | null => {
  try {
    return computeDiscountPercent(item.originalPrice, item.price)
  } catch {
    return null
  }
}

export const DealCard: React.FC<Props> = ({ item }) => {
  const image = item.image && typeof item.image !== 'number' ? (item.image as MediaType) : false
  const discount = safeDiscountPercent(item)

  return (
    <Link
      className="relative inline-block h-full w-full group"
      href={`/${item.collection}/${item.slug}`}
    >
      <div className="relative">
        {image ? (
          <Media
            className={clsx('relative aspect-square object-cover border rounded-2xl bg-base-200')}
            height={80}
            imgClassName={clsx('h-full w-full object-cover rounded-2xl', {
              'transition duration-300 ease-in-out group-hover:scale-102': true,
            })}
            resource={image}
            width={80}
          />
        ) : null}

        {discount !== null && (
          <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
            -{discount}%
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {item.retailerName && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.retailerName}
          </span>
        )}

        <div className="line-clamp-2 text-base-content">{item.title}</div>

        <div className="flex items-baseline gap-2">
          {typeof item.price === 'number' && (
            <Price amount={item.price} currencyCode={item.currency} className="font-semibold" />
          )}
          {typeof item.originalPrice === 'number' && (
            <Price
              amount={item.originalPrice}
              currencyCode={item.currency}
              className="text-sm"
              strikethrough
            />
          )}
        </div>
      </div>
    </Link>
  )
}
