import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'

import { features } from '@/infrastructure/features'
import { OrderItem } from '@/modules/orders/components/order-item/order-item.component'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function Orders() {
  if (!features.products) return notFound()

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const t = await getTranslations('orders')

  let orders: Order[] | null = null

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t('loginRequired'))}`)
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch {}

  return (
    <>
      <div className="p-8 rounded-lg bg-base-200 w-full">
        <h1 className="text-3xl font-medium mb-8">{t('title')}</h1>
        {(!orders || !Array.isArray(orders) || orders?.length === 0) && <p>{t('noOrders')}</p>}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-6">
            {orders?.map((order) => (
              <li key={order.id}>
                <OrderItem
                  order={order}
                  itemLabel={t('item')}
                  itemPluralLabel={t('itemPlural')}
                  viewOrderLabel={t('viewOrder')}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('ordersDescription'),
    openGraph: mergeOpenGraph({
      title: t('ordersTitle'),
      url: '/orders',
    }),
    title: t('ordersTitle'),
  }
}
