import type { Booking } from '@/payload-types'
import { Button } from '@/shared/components/ui/button'
import { formatDateTime } from '@/shared/utils/format-date-time.util'
import Link from 'next/link'

type Props = {
  booking: Booking
  viewBookingLabel?: string
}

export const BookingItem: React.FC<Props> = ({ booking, viewBookingLabel = 'View Booking' }) => {
  const serviceName =
    booking.service && typeof booking.service === 'object' ? booking.service.title : null
  const staffName = booking.staff && typeof booking.staff === 'object' ? booking.staff.name : null
  const storeName =
    booking.modality === 'inStore' && booking.store && typeof booking.store === 'object'
      ? booking.store.name
      : null
  const addressLine =
    booking.modality === 'delivery' && booking.address && typeof booking.address === 'object'
      ? booking.address.addressLine1
      : null

  return (
    <div className="bg-card border rounded-lg px-4 py-2 md:px-6 md:py-4 flex flex-col sm:flex-row gap-12 sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm uppercase tracking-widest text-base-content/50 truncate max-w-32 sm:max-w-none">{`#${booking.id}`}</h3>

        <p className="text-xl">
          <time dateTime={booking.startDatetime}>
            {formatDateTime({ date: booking.startDatetime, format: 'MMMM dd, yyyy HH:mm' })}
          </time>
        </p>

        <p className="flex gap-2 text-xs text-base-content/80">
          {serviceName && <span>{serviceName}</span>}
          {staffName && (
            <>
              <span>•</span>
              <span>{staffName}</span>
            </>
          )}
          {storeName && (
            <>
              <span>•</span>
              <span>{storeName}</span>
            </>
          )}
          {addressLine && (
            <>
              <span>•</span>
              <span>{addressLine}</span>
            </>
          )}
        </p>
      </div>

      <Button variant="outline" asChild className="self-start sm:self-auto">
        <Link href={`/bookings/${booking.id}`}>{viewBookingLabel}</Link>
      </Button>
    </div>
  )
}
