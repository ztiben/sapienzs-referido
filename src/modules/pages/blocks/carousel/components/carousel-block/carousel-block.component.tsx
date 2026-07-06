import type { DisplayItem } from '@/shared/utils/to-display-item.util'
import type { CarouselBlock as CarouselBlockProps, Product, Service } from '@/payload-types'

import { toDisplayItem } from '@/shared/utils/to-display-item.util'
import configPromise from '@payload-config'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'

import { CarouselClient } from '../carousel/carousel.component.client'

export const CarouselBlock: React.FC<
  CarouselBlockProps & {
    id?: DefaultDocumentIDType
  }
> = async (props) => {
  const { categories, limit = 3, populateBy, selectedDocs, showFrom } = props

  let items: DisplayItem[] = []

  if (populateBy === 'category') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.length
      ? categories.map((category) => {
          if (typeof category === 'object') return category.id
          else return category
        })
      : null

    const whereClause =
      flattenedCategories && flattenedCategories.length > 0
        ? { categories: { in: flattenedCategories } }
        : undefined

    const collectionsToFetch =
      showFrom === 'all'
        ? (['products', 'services'] as const)
        : showFrom === 'services'
          ? (['services'] as const)
          : (['products'] as const)

    const fetches = collectionsToFetch.map(async (collection) => {
      const result = await payload.find({
        collection,
        depth: 1,
        limit: limit || undefined,
        draft: false,
        overrideAccess: false,
        where: {
          and: [...(whereClause ? [whereClause] : []), { _status: { equals: 'published' } }],
        },
      })
      return result.docs.map((doc) => toDisplayItem(doc as Product | Service, collection))
    })

    const results = await Promise.all(fetches)
    items = results.flat()
  } else if (selectedDocs?.length) {
    items = selectedDocs
      .map((doc) => {
        if (typeof doc.value === 'object' && doc.value !== null) {
          return toDisplayItem(
            doc.value as Product | Service,
            doc.relationTo as 'products' | 'services',
          )
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
