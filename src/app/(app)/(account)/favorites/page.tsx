import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { FavoritesListing } from '@/modules/deals/components/favorites-listing/favorites-listing.component.client'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'

export default async function FavoritesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const t = await getTranslations('favorites')
  const tAccount = await getTranslations('account')

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(tAccount('loginRequired'))}`)
  }

  return (
    <div className="p-8 rounded-lg bg-base-200">
      <h1 className="text-3xl font-medium mb-8">{t('title')}</h1>
      <FavoritesListing />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('favoritesDescription'),
    openGraph: mergeOpenGraph({
      title: t('favoritesTitle'),
      url: '/favorites',
    }),
    title: t('favoritesTitle'),
  }
}
