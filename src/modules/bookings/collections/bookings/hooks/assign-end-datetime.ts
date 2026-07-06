import { computeBookingEndDatetime } from '@/modules/bookings/bl/booking-end-datetime.bl'
import type { Booking } from '@/payload-types'
import type { CollectionBeforeValidateHook } from 'payload'

export const assignEndDatetime: CollectionBeforeValidateHook<Booking> = async ({
  data,
  originalDoc,
  req,
}) => {
  const service = data?.service ?? originalDoc?.service
  const startDatetime = data?.startDatetime ?? originalDoc?.startDatetime
  if (service == null || startDatetime == null) return data

  const serviceId = typeof service === 'number' ? service : service.id
  const fullService = await req.payload.findByID({
    collection: 'services',
    id: serviceId,
    depth: 0,
    req,
  })

  return {
    ...data,
    endDatetime: computeBookingEndDatetime({
      startDatetime,
      durationMinutes: fullService.durationMinutes,
    }),
  }
}
