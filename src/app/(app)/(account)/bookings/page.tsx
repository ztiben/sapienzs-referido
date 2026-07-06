import type { Booking } from '@/payload-types'
import type { Metadata } from 'next'

import { features } from '@/infrastructure/features'
import { BookingItem } from '@/modules/bookings/components/booking-item/booking-item.component'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function Bookings() {
  if (!features.services) return notFound()

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const t = await getTranslations('bookings')

  let bookings: Booking[] | null = null

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t('loginRequired'))}`)
  }

  try {
    const bookingsResult = await payload.find({
      collection: 'bookings',
      limit: 0,
      pagination: false,
      sort: 'startDatetime',
      depth: 1,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    bookings = bookingsResult?.docs || []
  } catch {}

  return (
    <>
      <div className="p-8 rounded-lg bg-base-200 w-full">
        <h1 className="text-3xl font-medium mb-8">{t('title')}</h1>

        {(!bookings || !Array.isArray(bookings) || bookings?.length === 0) && (
          <p>{t('noBookings')}</p>
        )}

        {bookings && bookings.length > 0 && (
          <ul className="flex flex-col gap-6">
            {bookings?.map((booking) => (
              <li key={booking.id}>
                <BookingItem booking={booking} viewBookingLabel={t('viewBooking')} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  if (!features.services) return notFound()

  const tMeta = await getTranslations('metadata')

  return {
    description: tMeta('bookingsDescription'),
    openGraph: mergeOpenGraph({
      title: tMeta('bookingsTitle'),
      url: '/bookings',
    }),
    title: tMeta('bookingsTitle'),
  }
}
