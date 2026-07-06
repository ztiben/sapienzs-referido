import type { CarouselBlock as CarouselBlockProps, Deal } from '@/payload-types'
import type { DisplayItem } from '@/shared/utils/to-display-item.util'

import { toDisplayItem } from '@/shared/utils/to-display-item.util'
import configPromise from '@payload-config'
import { getLocale } from 'next-intl/server'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'

import { CarouselClient } from '../carousel/carousel.component.client'

export const CarouselBlock: React.FC<
  CarouselBlockProps & {
    id?: DefaultDocumentIDType
  }
> = async (props) => {
  const { categories, limit = 3, populateBy, selectedDocs } = props

  let items: DisplayItem[] = []

  if (populateBy === 'category') {
    const payload = await getPayload({ config: configPromise })
    const locale = (await getLocale()) as 'es' | 'en'

    const flattenedCategories = categories?.length
      ? categories.map((category) => {
          if (typeof category === 'object') return category.id
          else return category
        })
      : null

    const whereClause =
      flattenedCategories && flattenedCategories.length > 0
        ? { category: { in: flattenedCategories } }
        : undefined

    const result = await payload.find({
      collection: 'deals',
      depth: 1,
      limit: limit || undefined,
      locale,
      draft: false,
      overrideAccess: false,
      where: {
        and: [...(whereClause ? [whereClause] : []), { _status: { equals: 'published' } }],
      },
    })

    items = result.docs.map((doc) => toDisplayItem(doc as Deal))
  } else if (selectedDocs?.length) {
    items = selectedDocs
      .map((doc) => {
        if (typeof doc.value === 'object' && doc.value !== null) {
          return toDisplayItem(doc.value as Deal)
        }
        return null
      })
      .filter((item): item is DisplayItem => item !== null)
  }

  if (!items?.length) return null

  return (
    <div className=" w-full pb-6 pt-1">
      <CarouselClient items={items} />
    </div>
  )
}
