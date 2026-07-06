import type { Metadata } from 'next'

import { features } from '@/infrastructure/features'
import { ConfirmOrder } from '@/modules/checkout/components/confirm-order/confirm-order.component.client'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default function ConfirmOrderPage() {
  if (!features.products) return notFound()

  return (
    <div className="container min-h-[90vh] flex py-12">
      <Suspense>
        <ConfirmOrder />
      </Suspense>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('confirmOrderDescription'),
    openGraph: mergeOpenGraph({
      title: t('confirmOrderTitle'),
      url: '/checkout/confirm-order',
    }),
    title: t('confirmOrderTitle'),
  }
}
