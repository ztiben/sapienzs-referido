import type { DisplayItem } from '@/shared/utils/to-display-item.util'
import type { ArchiveBlock as ArchiveBlockProps, Product, Service } from '@/payload-types'

import { toDisplayItem } from '@/shared/utils/to-display-item.util'
import { RichText } from '@/modules/pages/components/rich-text/rich-text.component'
import configPromise from '@payload-config'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'

import { CollectionArchive } from '@/modules/pages/blocks/archive-block/components/collection-archive/collection-archive.component'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    showFrom,
  } = props

  const limit = limitFromProps || 3

  let items: DisplayItem[] = []

  if (populateBy === 'category') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

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
        limit,
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
  } else {
    if (selectedDocs?.length) {
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
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ml-0 max-w-3xl" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={items} />
    </div>
  )
}
