import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import React from 'react'

import { Button } from '@/shared/components/ui/button'

export default async function NotFound() {
  const t = await getTranslations('errors')

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">{t('pageNotFound')}</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">{t('goHome')}</Link>
      </Button>
    </div>
  )
}
