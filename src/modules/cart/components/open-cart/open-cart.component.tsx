'use client'

import { features } from '@/infrastructure/features'
import { Button, type ButtonProps } from '@/shared/components/ui/button'
import { useTranslations } from 'next-intl'

export function OpenCartButton({ quantity, ...props }: { quantity?: number } & ButtonProps) {
  const t = useTranslations('cart')

  if (!features.products) return null

  return (
    <Button
      variant="nav"
      size="clear"
      className="navLink relative items-end hover:cursor-pointer"
      {...props}
    >
      <span>{t('cart')}</span>

      {quantity ? (
        <>
          <span>•</span>
          <span>{quantity}</span>
        </>
      ) : null}
    </Button>
  )
}
