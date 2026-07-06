'use client'

import { useTranslations } from 'next-intl'

export default function Error({ reset }: { reset: () => void }) {
  const t = useTranslations('errors')

  return (
    <div className="mx-auto my-4 flex max-w-xl flex-col rounded-lg border p-8 md:p-12">
      <h2 className="text-xl font-bold">{t('oops')}</h2>
      <p className="my-2">{t('storeError')}</p>
      <button
        className="mx-auto mt-4 flex w-full items-center justify-center rounded-full p-4 tracking-wide hover:opacity-90"
        onClick={() => reset()}
        type="button"
      >
        {t('tryAgain')}
      </button>
    </div>
  )
}
