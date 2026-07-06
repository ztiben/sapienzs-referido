import type { SortFilterItem as SortFilterItemType } from '@/modules/products/models/search.model'

import { createUrl } from '@/shared/utils/create-url.util'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import type { PathFilterItem as PathFilterItemType } from '../filter-list/filter-list.component'

export const usePathFilterItem = (item: PathFilterItemType) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = pathname === item.path
  const newParams = new URLSearchParams(searchParams.toString())
  newParams.delete('q')

  return {
    active,
    href: createUrl(item.path, newParams),
    Tag: active ? 'p' : Link,
  }
}

export const useSortFilterItem = (item: SortFilterItemType) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = searchParams.get('sort') === item.slug
  const q = searchParams.get('q')
  const type = searchParams.get('type')
  const category = searchParams.get('category')

  const href = createUrl(
    pathname,
    new URLSearchParams({
      ...(q && { q }),
      ...(type && { type }),
      ...(category && { category }),
      ...(item.slug && item.slug.length && { sort: item.slug }),
    }),
  )

  return { active, href, Tag: active ? 'p' : Link }
}
