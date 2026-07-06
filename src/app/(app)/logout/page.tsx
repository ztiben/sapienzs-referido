import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import { getTranslations } from 'next-intl/server'
import React from 'react'

import { LogoutPage } from './LogoutPage'

export default async function Logout() {
  return (
    <div className="container max-w-lg my-16">
      <LogoutPage />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('logoutDescription'),
    openGraph: mergeOpenGraph({
      title: t('logoutTitle'),
      url: '/logout',
    }),
    title: t('logoutTitle'),
  }
}
