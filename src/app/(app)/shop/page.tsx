import { features } from '@/infrastructure/features'
import {
  toDisplayItem,
  type DisplayItem,
} from '@/shared/utils/to-display-item.util'
import { Grid } from '@/modules/products/components/grid/grid.component'
import type { Product, Service } from '@/payload-types'
import { ProductGridItem } from '@/shared/components/product-grid-item/product-grid-item.component'
import { getCachedGlobal } from '@/shared/utils/get-globals.util'
import configPromise from '@payload-config'
import { type Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('shopDescription'),
    title: t('shopTitle'),
  }
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, type, category } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations('shop')

  const configuration = await getCachedGlobal('configuration')()

  // When only one module is active, force its type regardless of query param
  const resolvedType =
    features.products && !features.services
      ? 'products'
      : !features.products && features.services
        ? 'services'
        : (type ?? configuration.shop?.defaultShopType)

  const isServices = resolvedType === 'services'

  let items: DisplayItem[]

  if (isServices) {
    const services = await payload.find({
      collection: 'services',
      draft: false,
      overrideAccess: false,
      pagination: false,
      ...(sort ? { sort } : { sort: 'title' }),
      ...(searchValue || category
        ? {
            where: {
              and: [
                { _status: { equals: 'published' } },
                ...(searchValue ? [{ title: { like: searchValue } }] : []),
                ...(category ? [{ categories: { contains: category } }] : []),
              ],
            },
          }
        : {}),
    })

    items = services.docs.map((doc) => toDisplayItem(doc as Service, 'services'))
  } else {
    const products = await payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      pagination: false,
      ...(sort ? { sort } : { sort: 'title' }),
      ...(searchValue || category
        ? {
            where: {
              and: [
                { _status: { equals: 'published' } },
                ...(searchValue ? [{ title: { like: searchValue } }] : []),
                ...(category ? [{ categories: { contains: category } }] : []),
              ],
            },
          }
        : {}),
    })

    items = products.docs.map((doc) => toDisplayItem(doc as Product, 'products'))
  }

  const resultsText = items.length > 1 ? t('results') : t('result')

  return (
    <div>
      {searchValue ? (
        <p className="mb-4">
          {items.length === 0
            ? t('noItemsMatch')
            : t('showing', { count: items.length, resultsText })}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && items.length === 0 && <p className="mb-4">{t('noItems')}</p>}

      {items.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <ProductGridItem key={index} item={item} />
          ))}
        </Grid>
      ) : null}
    </div>
  )
}
