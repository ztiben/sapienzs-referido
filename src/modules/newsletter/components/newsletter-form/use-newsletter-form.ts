import { useLocale, useTranslations } from 'next-intl'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

type SubscribeArg = {
  email: string
  locale: string
  source?: string
}

const subscribeFetcher = async (
  url: string,
  { arg }: { arg: SubscribeArg },
): Promise<{ subscribed: boolean }> => {
  const res = await fetch(url, {
    body: JSON.stringify(arg),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to subscribe')
  return res.json()
}

export const useNewsletterForm = (source?: string) => {
  const locale = useLocale()
  const t = useTranslations('newsletter')

  const { trigger, isMutating } = useSWRMutation('/api/subscribers/subscribe', subscribeFetcher)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const email = (form.email as HTMLInputElement).value

    try {
      await trigger({ email, locale, source })
      toast.success(t('success'))
      form.reset()
    } catch {
      toast.error(t('error'))
    }
  }

  return { onSubmit, isMutating }
}
