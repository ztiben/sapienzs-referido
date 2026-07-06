import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export const useLanguageSwitcher = () => {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const nextLocale = locale === 'es' ? 'en' : 'es'

  const switchLocale = () => {
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`
    startTransition(() => {
      router.refresh()
    })
  }

  return { nextLocale, isPending, switchLocale }
}
