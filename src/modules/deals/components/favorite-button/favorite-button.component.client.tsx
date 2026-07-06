'use client'

import { HeartIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/cn.util'

import { useFavoriteButton } from './use-favorite-button'

type Props = {
  dealId: number
  className?: string
}

export const FavoriteButton: React.FC<Props> = ({ dealId, className }) => {
  const { isFavorited, isMutating, onToggle } = useFavoriteButton(dealId)
  const t = useTranslations('deals')

  return (
    <Button
      className={className}
      disabled={isMutating}
      onClick={onToggle}
      type="button"
      variant="outline"
    >
      <HeartIcon className={cn('h-4 w-4', isFavorited && 'fill-destructive text-destructive')} />
      {isFavorited ? t('removeFavorite') : t('addFavorite')}
    </Button>
  )
}
