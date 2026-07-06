import type { Booking } from '@/payload-types'
import { ValidationError, type CollectionBeforeChangeHook } from 'payload'
import { checkStaffSchedule } from '../bl/staff-schedule.bl'

export const checkStaffScheduleBeforeChange: CollectionBeforeChangeHook<Booking> = async ({
  data,
  originalDoc,
  req,
}) => {
  const staff = data.staff ?? originalDoc?.staff
  const startDatetime = data.startDatetime ?? originalDoc?.startDatetime

  if (staff == null || startDatetime == null) return

  const staffId = typeof staff === 'number' ? staff : staff.id

  const fullStaff = await req.payload.findByID({
    collection: 'staff',
    id: staffId,
    depth: 0,
    req,
  })

  try {
    checkStaffSchedule({ staff: fullStaff, startDatetime })
  } catch (error) {
    // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
    let message = req.t('custom:errorUnknown')

    if (error instanceof Error) {
      if (error.cause === 'incomplete') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:errorIncompleteData')
      } else if (error.cause === 'invalid') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:bookingOutsideStaffSchedule')
      }
    }

    throw new ValidationError({
      errors: [{ path: 'startDatetime', message }],
    })
  }
}
