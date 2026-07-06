'use client'

import { LoadingSpinner } from '@/shared/components/loading-spinner/loading-spinner.component'
import { Button } from '@/shared/components/ui/button'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

import { useConfirmOrder } from './use-confirm-order'

export const ConfirmOrder: React.FC = () => {
  const t = useTranslations('confirmOrder')
  const { status, errorMessage } = useConfirmOrder()

  if (status === 'confirming') {
    return (
      <div className="text-center w-full flex flex-col items-center justify-start gap-4 py-12">
        <h1 className="text-3xl font-medium">{t('confirming')}</h1>

        <LoadingSpinner className="w-12 h-6" />
      </div>
    )
  }

  if (status === 'confirmed') {
    return (
      <div className="text-center w-full flex flex-col items-center justify-start gap-4 py-12">
        <h1 className="text-3xl font-medium">{t('confirmed')}</h1>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="text-center w-full flex flex-col items-center justify-start gap-6 py-12">
        <h1 className="text-3xl font-medium">{t('processing')}</h1>
        <div className="prose max-w-2xl">
          <p>{t('processingDescription')}</p>
          <p className="text-sm text-base-content/70">{t('checkOrderStatus')}</p>
        </div>
        <Button asChild size="lg" className="mt-4">
          <Link href="/orders">{t('viewMyOrders')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center w-full flex flex-col items-center justify-start gap-6 py-12">
      <h1 className="text-3xl font-medium text-destructive">{t('error')}</h1>
      <div className="prose max-w-2xl">
        <p>{errorMessage}</p>
      </div>
      <Button asChild size="lg" className="mt-4">
        <Link href="/checkout">{t('returnToCheckout')}</Link>
      </Button>
    </div>
  )
}
