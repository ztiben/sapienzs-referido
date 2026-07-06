import type { Metadata } from 'next'

import { features } from '@/infrastructure/features'
import { FindOrderForm } from '@/modules/orders/components/find-order-form/find-order-form.component.client'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers.js'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

export default async function FindOrderPage() {
  if (!features.products) return notFound()
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div className="container py-16">
      <FindOrderForm initialEmail={user?.email} />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('findOrderDescription'),
    openGraph: mergeOpenGraph({
      title: t('findOrderTitle'),
      url: '/find-order',
    }),
    title: t('findOrderTitle'),
  }
}
