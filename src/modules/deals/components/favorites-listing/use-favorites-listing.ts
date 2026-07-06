import useSWR from 'swr'

import type { Deal, Favorite } from '@/payload-types'
import { toDisplayItem, type DisplayItem } from '@/shared/utils/to-display-item.util'

type FavoritesResponse = {
  docs: Favorite[]
  totalDocs: number
}

export const useFavoritesListing = () => {
  const { data, isLoading, mutate } = useSWR<FavoritesResponse>(
    '/api/favorites?depth=2&limit=100&sort=-createdAt',
  )

  const items: DisplayItem[] = (data?.docs ?? [])
    .map((favorite) => favorite.deal)
    .filter((deal): deal is Deal => typeof deal === 'object' && deal !== null)
    .map(toDisplayItem)

  return { items, isLoading, mutate }
}
