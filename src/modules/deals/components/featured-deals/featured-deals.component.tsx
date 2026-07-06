import configPromise from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { toDisplayItem } from '@/shared/utils/to-display-item.util'
import { DealGrid } from '../deal-grid/deal-grid.component'

type Props = {
  limit?: number
}

export const FeaturedDeals: React.FC<Props> = async ({ limit = 8 }) => {
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
      and: [{ featured: { equals: true } }, { _status: { equals: 'published' } }],
    },
  })

  if (!result.docs.length) return null

  return (
    <section className="container my-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-semibold md:text-3xl">{t('featuredTitle')}</h2>
        <Link className="text-sm underline-offset-4 hover:underline" href="/deals">
          {t('seeAllDeals')} →
        </Link>
      </div>

      <DealGrid items={result.docs.map(toDisplayItem)} />
    </section>
  )
}
