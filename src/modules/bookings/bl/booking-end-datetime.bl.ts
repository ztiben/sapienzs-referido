import type { Booking, Service } from '@/payload-types'

export const computeBookingEndDatetime = ({
  startDatetime,
  durationMinutes,
}: {
  startDatetime: Booking['startDatetime']
  durationMinutes: Service['durationMinutes']
}): string => {
  const startMs = new Date(startDatetime).getTime()
  return new Date(startMs + durationMinutes * 60_000).toISOString()
}
