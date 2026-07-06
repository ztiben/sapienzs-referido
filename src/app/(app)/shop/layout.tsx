import { features } from '@/infrastructure/features'
import { Categories } from '@/modules/products/components/search/category-list/category-list.component'
import { FilterList } from '@/modules/products/components/search/filter-list/filter-list.component'
import { TypeFilter } from '@/modules/products/components/search/type-list/type-list.component'
import { sorting } from '@/modules/products/constants/search.constants'
import { Search } from '@/shared/components/search/search.component.client'
import { getCachedGlobal } from '@/shared/utils/get-globals.util'
import { getTranslations } from 'next-intl/server'
import React, { Suspense } from 'react'

const showTypeFilter = features.products && features.services

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('shop')
  const configuration = await getCachedGlobal('configuration')()
  const defaultShopType =
    configuration.shop?.defaultShopType || (features.products ? 'products' : 'services')

  return (
    <Suspense fallback={null}>
      <div className="container flex flex-col gap-8 my-16 pb-4 ">
        <Search className="mb-8" />

        <div className="flex flex-col md:flex-row items-start justify-between gap-16 md:gap-4">
          <div className="w-full flex-none flex flex-col gap-4 md:gap-8 basis-1/5">
            {showTypeFilter && <TypeFilter defaultShopType={defaultShopType} />}
            <Categories />
            <FilterList list={sorting} title={t('sortBy')} />
          </div>
          <div className="min-h-screen w-full">{children}</div>
        </div>
      </div>
    </Suspense>
  )
}
