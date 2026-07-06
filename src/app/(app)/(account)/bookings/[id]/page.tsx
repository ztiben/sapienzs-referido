import type { Booking } from '@/payload-types'
import type { Metadata } from 'next'

import { features } from '@/infrastructure/features'
import { AddressItem } from '@/shared/components/address-item/address-item.component.client'
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
}

export default async function BookingDetail({ params }: PageProps) {
  if (!features.services) return notFound()

  const t = await getTranslations('bookings')
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params

  let booking: Booking | null = null

  try {
    const {
      docs: [bookingResult],
    } = await payload.find({
      collection: 'bookings',
      user,
      overrideAccess: false,
      depth: 2,
      where: {
        and: [{ id: { equals: id } }, ...(user ? [{ customer: { equals: user.id } }] : [])],
      },
    })

    if (
      bookingResult &&
      user &&
      (typeof bookingResult.customer === 'object'
        ? bookingResult.customer.id
        : bookingResult.customer) === user.id
    ) {
      booking = bookingResult
    }
  } catch {}

  if (!booking) {
    notFound()
  }

  const serviceName =
    booking.service && typeof booking.service === 'object' ? booking.service.title : null
  const staffName = booking.staff && typeof booking.staff === 'object' ? booking.staff.name : null

  return (
    <div>
      <div className="flex gap-8 justify-between items-center mb-6">
        {user ? (
          <Button asChild variant="ghost">
            <Link href="/bookings">
              <ChevronLeftIcon />
              {t('backToBookings')}
            </Link>
          </Button>
        ) : (
          <div></div>
        )}

        <h1 className="text-sm uppercase px-2 bg-primary/10 rounded tracking-[0.07em]">
          {`Booking #${booking.id}`}
        </h1>
      </div>

      <div className="bg-card border rounded-lg px-6 py-4 flex flex-col gap-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="">
            <p className="uppercase text-base-content/50 mb-1 text-sm">{t('bookingDate')}</p>
            <p className="text-lg">
              <time dateTime={booking.startDatetime}>
                {formatDateTime({ date: booking.startDatetime, format: 'MMMM dd, yyyy HH:mm' })}
              </time>
            </p>
          </div>

          {serviceName && (
            <div className="">
              <p className="uppercase text-base-content/50 mb-1 text-sm">{t('service')}</p>
              <p className="text-lg">{serviceName}</p>
            </div>
          )}

          {staffName && (
            <div className="">
              <p className="uppercase text-base-content/50 mb-1 text-sm">{t('staff')}</p>
              <p className="text-lg">{staffName}</p>
            </div>
          )}

          <div>
            <p className="uppercase text-base-content/50 mb-1 text-sm">{t('location')}</p>
            {booking.modality === 'inStore' &&
              booking.store &&
              typeof booking.store === 'object' && <p className="text-lg">{booking.store.name}</p>}
            {booking.modality === 'delivery' &&
              booking.address &&
              typeof booking.address === 'object' && (
                <AddressItem address={booking.address} hideActions />
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!features.services) return notFound()

  const { id } = await params
  const tMeta = await getTranslations('metadata')

  return {
    description: tMeta('bookingDetailDescription', { id }),
    openGraph: mergeOpenGraph({
      title: tMeta('bookingDetailTitle', { id }),
      url: `/bookings/${id}`,
    }),
    title: tMeta('bookingDetailTitle', { id }),
  }
}
