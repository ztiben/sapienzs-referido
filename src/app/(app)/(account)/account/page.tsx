import type { Metadata } from 'next'

import { features } from '@/infrastructure/features'
import { AccountForm } from '@/modules/account/components/account-form/account-form.component.client'
import { BookingItem } from '@/modules/bookings/components/booking-item/booking-item.component'
import { OrderItem } from '@/modules/orders/components/order-item/order-item.component'
import { Booking, Order } from '@/payload-types'
import { Button } from '@/shared/components/ui/button'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const t = await getTranslations('account')
  const tOrders = await getTranslations('orders')
  const tBookings = await getTranslations('bookings')

  let orders: Order[] | null = null
  let bookings: Booking[] | null = null

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t('loginRequired'))}`)
  }

  if (features.products) {
    try {
      const ordersResult = await payload.find({
        collection: 'orders',
        limit: 5,
        user,
        overrideAccess: false,
        pagination: false,
        where: {
          customer: {
            equals: user?.id,
          },
        },
      })

      orders = ordersResult?.docs || []
    } catch {}
  }

  if (features.services) {
    try {
      const bookingsResult = await payload.find({
        collection: 'bookings',
        limit: 5,
        user,
        overrideAccess: false,
        pagination: false,
        sort: 'startDatetime',
        depth: 1,
        where: {
          and: [
            { customer: { equals: user?.id } },
            { startDatetime: { greater_than: new Date().toISOString() } },
          ],
        },
      })

      bookings = bookingsResult?.docs || []
    } catch {}
  }

  return (
    <>
      <div className="p-8 rounded-lg bg-base-200">
        <h1 className="text-3xl font-medium mb-8">{t('settings')}</h1>
        <AccountForm />
      </div>

      {features.products && (
        <div className="p-8 rounded-lg bg-base-200">
          <h2 className="text-3xl font-medium mb-8">{t('recentOrders')}</h2>

          <div className="prose mb-8">
            <p>{t('recentOrdersDescription')}</p>
          </div>

          {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
            <p className="mb-8">{t('noOrders')}</p>
          )}

          {orders && orders.length > 0 && (
            <ul className="flex flex-col gap-6 mb-8">
              {orders?.map((order) => (
                <li key={order.id}>
                  <OrderItem
                    order={order}
                    itemLabel={tOrders('item')}
                    itemPluralLabel={tOrders('itemPlural')}
                    viewOrderLabel={tOrders('viewOrder')}
                  />
                </li>
              ))}
            </ul>
          )}

          <Button asChild variant="link">
            <Link href="/orders">{t('viewAllOrders')}</Link>
          </Button>
        </div>
      )}

      {features.services && (
        <div className="p-8 rounded-lg bg-base-200">
          <h2 className="text-3xl font-medium mb-8">{t('recentBookings')}</h2>

          <div className="prose mb-8">
            <p>{t('recentBookingsDescription')}</p>
          </div>

          {(!bookings || !Array.isArray(bookings) || bookings?.length === 0) && (
            <p className="mb-8">{t('noBookings')}</p>
          )}

          {bookings && bookings.length > 0 && (
            <ul className="flex flex-col gap-6 mb-8">
              {bookings?.map((booking) => (
                <li key={booking.id}>
                  <BookingItem booking={booking} viewBookingLabel={tBookings('viewBooking')} />
                </li>
              ))}
            </ul>
          )}

          <Button asChild variant="link">
            <Link href="/bookings">{t('viewAllBookings')}</Link>
          </Button>
        </div>
      )}
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('accountDescription'),
    openGraph: mergeOpenGraph({
      title: t('accountTitle'),
      url: '/account',
    }),
    title: t('accountTitle'),
  }
}
