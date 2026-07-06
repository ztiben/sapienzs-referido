'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

import { DealCard } from '@/shared/components/deal-card/deal-card.component'
import { LoadingSpinner } from '@/shared/components/loading-spinner/loading-spinner.component'
import { Button } from '@/shared/components/ui/button'

import { useFavoritesListing } from './use-favorites-listing'

export const FavoritesListing: React.FC = () => {
  const { items, isLoading } = useFavoritesListing()
  const t = useTranslations('favorites')

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-base-content/70">{t('empty')}</p>
        <Button asChild variant="outline">
          <Link href="/deals">{t('browseDeals')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
      {items.map((item) => (
        <DealCard item={item} key={item.slug} />
      ))}
    </div>
  )
}
