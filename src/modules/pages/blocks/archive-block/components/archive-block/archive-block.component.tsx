import type { ArchiveBlock as ArchiveBlockProps, Deal } from '@/payload-types'
import type { DisplayItem } from '@/shared/utils/to-display-item.util'

import { RichText } from '@/modules/pages/components/rich-text/rich-text.component'
import { toDisplayItem } from '@/shared/utils/to-display-item.util'
import configPromise from '@payload-config'
import { getLocale } from 'next-intl/server'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'

import { CollectionArchive } from '@/modules/pages/blocks/archive-block/components/collection-archive/collection-archive.component'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let items: DisplayItem[] = []

  if (populateBy === 'category') {
    const payload = await getPayload({ config: configPromise })
    const locale = (await getLocale()) as 'es' | 'en'

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const whereClause =
      flattenedCategories && flattenedCategories.length > 0
        ? { category: { in: flattenedCategories } }
        : undefined

    const result = await payload.find({
      collection: 'deals',
      depth: 1,
      limit,
      locale,
      draft: false,
      overrideAccess: false,
      where: {
        and: [...(whereClause ? [whereClause] : []), { _status: { equals: 'published' } }],
      },
    })

    items = result.docs.map((doc) => toDisplayItem(doc as Deal))
  } else {
    if (selectedDocs?.length) {
      items = selectedDocs
        .map((doc) => {
          if (typeof doc.value === 'object' && doc.value !== null) {
            return toDisplayItem(doc.value as Deal)
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
