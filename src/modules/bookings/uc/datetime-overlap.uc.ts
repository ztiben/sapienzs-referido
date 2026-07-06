import type { Booking } from '@/payload-types'
import { ValidationError, type CollectionBeforeChangeHook } from 'payload'
import {
  checkNoDatetimeOverlapBlock,
  checkNoDatetimeOverlapBooking,
} from '../bl/datetime-overlap.bl'
import { MAX_DURATION_MINUTES } from '../constants/services.constants'

export const checkNoDatetimeOverlapBookingBeforeChange: CollectionBeforeChangeHook<
  Booking
> = async ({ data, originalDoc, req }) => {
  const staff = data.staff ?? originalDoc?.staff
  const startDatetime = data.startDatetime ?? originalDoc?.startDatetime
  const endDatetime = data.endDatetime ?? originalDoc?.endDatetime

  if (staff == null || startDatetime == null || endDatetime == null) return

  const staffId = typeof staff === 'number' ? staff : staff.id
  const bookingId = originalDoc?.id

  const newStart = new Date(startDatetime)
  const newEnd = new Date(endDatetime)

  const { docs: existingBookings } = await req.payload.find({
    collection: 'bookings',
    where: {
      and: [
        { staff: { equals: staffId } },
        {
          startDatetime: {
            greater_than: new Date(
              newStart.getTime() - MAX_DURATION_MINUTES * 60 * 1000,
            ).toISOString(),
          },
        },
        { endDatetime: { less_than: newEnd.toISOString() } },
        ...(bookingId != null ? [{ id: { not_equals: bookingId } }] : []),
      ],
    },
    depth: 0,
    limit: 0,
    req,
  })

  try {
    checkNoDatetimeOverlapBooking({
      existingBookings: existingBookings,
      newStartDatetime: startDatetime,
      newEndDatetime: endDatetime,
    })
  } catch (error) {
    // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
    let message = req.t('custom:errorUnknown')

    if (error instanceof Error && error.cause === 'invalid') {
      // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
      message = req.t('custom:bookingNoDatetimeOverlapBooking')
    }

    throw new ValidationError({
      errors: [{ path: 'startDatetime', message }],
    })
  }
}

export const checkNoDatetimeOverlapBlockBeforeChange: CollectionBeforeChangeHook<Booking> = async ({
  data,
  originalDoc,
  req,
}) => {
  const staff = data.staff ?? originalDoc?.staff
  const startDatetime = data.startDatetime ?? originalDoc?.startDatetime
  const endDatetime = data.endDatetime ?? originalDoc?.endDatetime

  if (staff == null || startDatetime == null || endDatetime == null) return

  const staffId = typeof staff === 'number' ? staff : staff.id

  const { docs: blocks } = await req.payload.find({
    collection: 'staff-blocks',
    where: { staff: { equals: staffId } },
    depth: 0,
    limit: 0,
    req,
  })

  try {
    checkNoDatetimeOverlapBlock({
      blocks,
      startDatetime,
      endDatetime,
    })
  } catch (error) {
    // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
    let message = req.t('custom:errorUnknown')

    if (error instanceof Error && error.cause === 'invalid') {
      // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
      message = req.t('custom:bookingNoDatetimeOverlapBlock')
    }

    throw new ValidationError({
      errors: [{ path: 'startDatetime', message }],
    })
  }
}
