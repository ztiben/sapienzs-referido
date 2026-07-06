import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { features } from '@/infrastructure/features'
import { AddressItem } from '@/shared/components/address-item/address-item.component.client'
import { OrderStatus } from '@/modules/orders/components/order-status/order-status.component'
import { ProductItem } from '@/modules/products/components/product-item/product-item.component'
import { Price } from '@/shared/components/price/price.component'
import { Button } from '@/shared/components/ui/button'
import { formatDateTime } from '@/shared/utils/format-date-time.util'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import configPromise from '@payload-config'
import { ChevronLeftIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  if (!features.products) return notFound()

  const t = await getTranslations('orders')
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params
  const { email = '' } = await searchParams

  let order: Order | null = null

  try {
    const {
      docs: [orderResult],
    } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          ...(user
            ? [
                {
                  customer: {
                    equals: user.id,
                  },
                },
              ]
            : []),
          ...(email
            ? [
                {
                  customerEmail: {
                    equals: email,
                  },
                },
              ]
            : []),
        ],
      },
      select: {
        amount: true,
        currency: true,
        items: true,
        customerEmail: true,
        customer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
      },
    })

    const canAccessAsGuest =
      !user &&
      email &&
      orderResult &&
      orderResult.customerEmail &&
      orderResult.customerEmail === email
    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult
    }
  } catch (error) {
    console.error(error)
  }

  if (!order) {
    notFound()
  }

  return (
    <div>
      <div className="flex gap-8 justify-between items-center mb-6">
        {user ? (
          <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/orders">
                <ChevronLeftIcon />
                {t('backToOrders')}
              </Link>
            </Button>
          </div>
        ) : (
          <div></div>
        )}

        <h1 className="text-sm uppercase px-2 bg-primary/10 rounded tracking-[0.07em]">
          <span className="">{`Order #${order.id}`}</span>
        </h1>
      </div>

      <div className="bg-card border rounded-lg px-6 py-4 flex flex-col gap-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="">
            <p className="uppercase text-base-content/50 mb-1 text-sm">{t('orderDate')}</p>
            <p className="text-lg">
              <time dateTime={order.createdAt}>
                {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
              </time>
            </p>
          </div>

          <div className="">
            <p className="uppercase text-base-content/50 mb-1 text-sm">{t('total')}</p>
            {order.amount && <Price className="text-lg" amount={order.amount} />}
          </div>

          {order.status && (
            <div className="grow max-w-1/3">
              <p className="uppercase text-base-content/50 mb-1 text-sm">{t('status')}</p>
              <OrderStatus className="text-sm" status={order.status} />
            </div>
          )}
        </div>

        {order.items && (
          <div>
            <h2 className="text-base-content/50 mb-4 uppercase text-sm">{t('items')}</h2>
            <ul className="flex flex-col gap-6">
              {order.items?.map((item, index) => {
                if (typeof item.product === 'string') {
                  return null
                }

                if (!item.product || typeof item.product !== 'object') {
                  return <div key={index}>{t('itemUnavailable')}</div>
                }

                const variant =
                  item.variant && typeof item.variant === 'object' ? item.variant : undefined

                return (
                  <li key={item.id}>
                    <ProductItem
                      product={item.product}
                      quantity={item.quantity}
                      variant={variant}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {order.shippingAddress && (
          <div>
            <h2 className="text-base-content/50 mb-4 uppercase text-sm">{t('shippingAddress')}</h2>
            <AddressItem address={order.shippingAddress} hideActions />
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!features.products) return notFound()

  const { id } = await params
  const tMeta = await getTranslations('metadata')

  return {
    description: tMeta('orderDetailDescription', { id }),
    openGraph: mergeOpenGraph({
      title: tMeta('orderDetailTitle', { id }),
      url: `/orders/${id}`,
    }),
    title: tMeta('orderDetailTitle', { id }),
  }
}
