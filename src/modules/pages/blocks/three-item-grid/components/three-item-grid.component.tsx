import type { Deal, Media, ThreeItemGridBlock as ThreeItemGridBlockProps } from '@/payload-types'
import type { DisplayItem } from '@/shared/utils/to-display-item.util'

import { GridTileImage } from '@/shared/components/grid-tile-image/grid-tile-image.component'
import { toDisplayItem } from '@/shared/utils/to-display-item.util'
import Link from 'next/link'
import type { DefaultDocumentIDType } from 'payload'
import React from 'react'

type Props = { item: DisplayItem; priority?: boolean; size: 'full' | 'half' }

export const ThreeItemGridItem: React.FC<Props> = ({ item, size }) => {
  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/${item.collection}/${item.slug}`}
      >
        <GridTileImage
          label={{
            amount: item.price,
            currencyCode: item.currency,
            position: size === 'full' ? 'center' : 'bottom',
            title: item.title,
          }}
          media={item.image as Media}
        />
      </Link>
    </div>
  )
}

export const ThreeItemGridBlock: React.FC<
  ThreeItemGridBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = async ({ items }) => {
  if (!items || items.length < 3) return null

  const displayItems = items
    .map((entry) => {
      if (typeof entry === 'object' && entry !== null && 'relationTo' in entry) {
        const doc = entry.value
        if (typeof doc === 'object' && doc !== null) {
          return toDisplayItem(doc as Deal)
        }
      }
      return null
    })
    .filter((item): item is DisplayItem => item !== null)

  if (displayItems.length < 3) return null

  const [first, second, third] = displayItems

  return (
    <section className="container grid gap-4 pb-4 md:grid-cols-6 md:grid-rows-2">
      <ThreeItemGridItem item={first} priority size="full" />
      <ThreeItemGridItem item={second} priority size="half" />
      <ThreeItemGridItem item={third} size="half" />
    </section>
  )
}
