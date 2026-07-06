import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { createUrl } from '@/shared/utils/create-url.util'

export const useDealFilters = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const retailer = searchParams?.get('retailer') || ''
  const category = searchParams?.get('category') || ''

  const setFilter = (name: 'retailer' | 'category', value: string) => {
    const newParams = new URLSearchParams(searchParams.toString())

    if (value) {
      newParams.set(name, value)
    } else {
      newParams.delete(name)
    }

    // Filter changes restart pagination.
    newParams.delete('page')

    router.push(createUrl(pathname, newParams))
  }

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('retailer')
    newParams.delete('category')
    newParams.delete('page')

    router.push(createUrl(pathname, newParams))
  }

  const hasFilters = Boolean(retailer || category)

  return { retailer, category, hasFilters, setFilter, clearFilters }
}
