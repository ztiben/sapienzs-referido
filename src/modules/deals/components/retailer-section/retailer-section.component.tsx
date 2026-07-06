import type { Media as MediaType, Retailer } from '@/payload-types'

import configPromise from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { Media } from '@/shared/components/media/media.component'
import { toDisplayItem } from '@/shared/utils/to-display-item.util'
import { DealGrid } from '../deal-grid/deal-grid.component'

type Props = {
  retailer: Retailer
  limit?: number
}

export const RetailerSection: React.FC<Props> = async ({ retailer, limit = 4 }) => {
  const payload = await getPayload({ config: configPromise })
  const locale = (await getLocale()) as 'es' | 'en'
  const t = await getTranslations('home')

  const result = await payload.find({
    collection: 'deals',
    depth: 1,
    limit,
    locale,
    draft: false,
    overrideAccess: false,
    sort: '-updatedAt',
    where: {
      and: [{ retailer: { equals: retailer.id } }, { _status: { equals: 'published' } }],
    },
  })

  if (!result.docs.length) return null

  const logo =
    retailer.logo && typeof retailer.logo === 'object' ? (retailer.logo as MediaType) : null

  return (
    <section className="container my-16">
      <div className="mb-8 flex items-end justify-between">
        <div className="flex items-center gap-3">
          {logo && (
            <Media
              className="h-8 w-8 overflow-hidden rounded-md"
              imgClassName="h-full w-full object-contain"
              resource={logo}
            />
          )}
          <h2 className="text-2xl font-semibold md:text-3xl">
            {t('retailerTitle', { retailer: retailer.name })}
          </h2>
        </div>
        <Link
          className="text-sm underline-offset-4 hover:underline"
          href={`/deals?retailer=${retailer.slug}`}
        >
          {t('seeRetailerDeals', { retailer: retailer.name })} →
        </Link>
      </div>

      <DealGrid items={result.docs.map(toDisplayItem)} />
    </section>
  )
}
