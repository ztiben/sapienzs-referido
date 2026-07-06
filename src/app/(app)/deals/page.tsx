import type { Metadata } from 'next'
import type { Where } from 'payload'

import configPromise from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'

import { DealFilters } from '@/modules/deals/components/deal-filters/deal-filters.component.client'
import { DealGrid } from '@/modules/deals/components/deal-grid/deal-grid.component'
import { Search } from '@/shared/components/search/search.component.client'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import { toDisplayItem } from '@/shared/utils/to-display-item.util'

const PAGE_SIZE = 12

type Args = {
  searchParams: Promise<{
    q?: string
    retailer?: string
    category?: string
    page?: string
  }>
}

const buildPageUrl = (
  params: { q?: string; retailer?: string; category?: string },
  page: number,
): string => {
  const urlParams = new URLSearchParams()
  if (params.q) urlParams.set('q', params.q)
  if (params.retailer) urlParams.set('retailer', params.retailer)
  if (params.category) urlParams.set('category', params.category)
  if (page > 1) urlParams.set('page', String(page))

  const query = urlParams.toString()
  return query ? `/deals?${query}` : '/deals'
}

export default async function DealsPage({ searchParams }: Args) {
  const { q, retailer, category, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const payload = await getPayload({ config: configPromise })
  const locale = (await getLocale()) as 'es' | 'en'
  const t = await getTranslations('deals')

  const [retailers, categories] = await Promise.all([
    payload.find({
      collection: 'retailers',
      limit: 100,
      depth: 0,
      overrideAccess: false,
      where: { active: { equals: true } },
    }),
    payload.find({
      collection: 'categories',
      limit: 100,
      depth: 0,
      locale,
      overrideAccess: false,
    }),
  ])

  const selectedRetailer = retailers.docs.find((doc) => doc.slug === retailer)
  const selectedCategory = categories.docs.find((doc) => doc.slug === category)

  const conditions: Where[] = [{ _status: { equals: 'published' } }]

  if (q) {
    conditions.push({
      or: [{ title: { like: q } }, { 'retailer.name': { like: q } }],
    })
  }
  if (selectedRetailer) {
    conditions.push({ retailer: { equals: selectedRetailer.id } })
  }
  if (selectedCategory) {
    conditions.push({ category: { equals: selectedCategory.id } })
  }

  const deals = await payload.find({
    collection: 'deals',
    depth: 1,
    limit: PAGE_SIZE,
    page,
    locale,
    draft: false,
    overrideAccess: false,
    sort: '-updatedAt',
    where: { and: conditions },
  })

  return (
    <div className="container flex flex-col gap-8 pb-24 pt-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold md:text-4xl">{t('allDealsTitle')}</h1>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Search className="md:max-w-sm" />
          <DealFilters
            categories={categories.docs.map((doc) => ({ label: doc.title, value: doc.slug }))}
            retailers={retailers.docs.map((doc) => ({ label: doc.name, value: doc.slug }))}
          />
        </div>
      </div>

      {deals.docs.length ? (
        <DealGrid items={deals.docs.map(toDisplayItem)} />
      ) : (
        <p className="py-16 text-center text-base-content/70">{t('noResults')}</p>
      )}

      {deals.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {deals.hasPrevPage && (
              <PaginationItem>
                <PaginationPrevious href={buildPageUrl({ q, retailer, category }, page - 1)} />
              </PaginationItem>
            )}
            {deals.hasNextPage && (
              <PaginationItem>
                <PaginationNext href={buildPageUrl({ q, retailer, category }, page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('dealsDescription'),
    openGraph: mergeOpenGraph({
      title: t('dealsTitle'),
      url: '/deals',
    }),
    title: t('dealsTitle'),
  }
}
