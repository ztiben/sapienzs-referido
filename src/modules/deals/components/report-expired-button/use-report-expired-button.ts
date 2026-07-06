import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

import { useAuth } from '@/shared/providers/auth.provider.client'

const createReportFetcher = async (
  url: string,
  { arg }: { arg: { deal: number } },
): Promise<unknown> => {
  const res = await fetch(url, {
    body: JSON.stringify(arg),
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to create report')
  return res.json()
}

export const useReportExpiredButton = (dealId: number) => {
  const { user } = useAuth()
  const router = useRouter()
  const t = useTranslations('deals')

  const { trigger, isMutating } = useSWRMutation('/api/deal-reports', createReportFetcher)

  const onReport = async () => {
    if (!user) {
      router.push(`/login?warning=${encodeURIComponent(t('loginToReport'))}`)
      return
    }

    try {
      await trigger({ deal: dealId })
      toast.success(t('reportSuccess'))
    } catch {
      toast.error(t('reportError'))
    }
  }

  return { isMutating, onReport }
}
