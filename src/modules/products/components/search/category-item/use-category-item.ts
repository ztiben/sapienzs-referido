import type { Category } from '@/payload-types'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const useCategoryItem = (category: Category) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = searchParams.get('category') === String(category.id)

  const setQuery = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (isActive) {
      params.delete('category')
    } else {
      params.set('category', String(category.id))
    }

    router.push(pathname + '?' + params.toString())
  }

  return { isActive, setQuery }
}
