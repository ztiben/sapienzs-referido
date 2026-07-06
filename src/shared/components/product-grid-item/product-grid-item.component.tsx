import type { DisplayItem } from '@/shared/utils/to-display-item.util'
import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/shared/components/media/media.component'
import { Price } from '@/shared/components/price/price.component'
import { currenciesConfig } from '@/infrastructure/currencies/currencies.config'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'

type Props = {
  item: DisplayItem
}

export const ProductGridItem: React.FC<Props> = ({ item }) => {
  const image = item.image && typeof item.image !== 'number' ? (item.image as MediaType) : false

  return (
    <Link
      className="relative inline-block h-full w-full group"
      href={`/${item.collection}/${item.slug}`}
    >
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

      <div className="text-base-content group-hover:text-base-content flex justify-between items-center mt-4">
        <div>{item.title}</div>

        {typeof item.price === 'number' && (
          <div className="">
            <Price amount={item.price} currencyCode={currenciesConfig.defaultCurrency} />
          </div>
        )}
      </div>
    </Link>
  )
}
