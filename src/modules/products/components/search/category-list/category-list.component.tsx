import configPromise from '@payload-config'
import clsx from 'clsx'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import { CategoryItem } from '../category-item/category-item.component.client'

async function CategoryList() {
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations('shop')

  const categories = await payload.find({
    collection: 'categories',
    sort: 'title',
  })

  return (
    <div>
      <h3 className="text-xs mb-2">{t('category')}</h3>

      <ul>
        {categories.docs.map((category) => {
          return <CategoryItem key={category.id} category={category} />
        })}
      </ul>
    </div>
  )
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded'
const items = 'bg-base-200'

export function Categories() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
        </div>
      }
    >
      <CategoryList />
    </Suspense>
  )
}
