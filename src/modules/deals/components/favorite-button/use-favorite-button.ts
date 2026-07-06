import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

import { useAuth } from '@/shared/providers/auth.provider.client'

type FavoritesResponse = {
  docs: { id: number }[]
  totalDocs: number
}

const toggleFetcher = async (url: string): Promise<{ favorited: boolean }> => {
  const res = await fetch(url, { credentials: 'include', method: 'POST' })
  if (!res.ok) throw new Error('Failed to toggle favorite')
  return res.json()
}

export const useFavoriteButton = (dealId: number) => {
  const { user } = useAuth()
  const router = useRouter()
  const t = useTranslations('deals')

  const favoritesKey = user
    ? `/api/favorites?where[deal][equals]=${dealId}&limit=1&depth=0`
    : null

  const { data, mutate } = useSWR<FavoritesResponse>(favoritesKey)

  const { trigger, isMutating } = useSWRMutation(`/api/deals/${dealId}/favorite`, toggleFetcher)

  const isFavorited = (data?.totalDocs ?? 0) > 0

  const onToggle = async () => {
    if (!user) {
      router.push(`/login?warning=${encodeURIComponent(t('loginToFavorite'))}`)
      return
    }

    try {
      const result = await trigger()
      await mutate()
      toast.success(result.favorited ? t('addedToFavorites') : t('removedFromFavorites'))
    } catch {
      toast.error(t('favoriteError'))
    }
  }

  return { isFavorited, isMutating, onToggle }
}
