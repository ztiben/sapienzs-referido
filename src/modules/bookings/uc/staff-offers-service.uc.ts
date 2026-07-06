import type { Booking } from '@/payload-types'
import { ValidationError, type CollectionBeforeChangeHook } from 'payload'
import { checkStaffOffersService } from '../bl/staff-offers-service.bl'

export const checkStaffOffersServiceBeforeChange: CollectionBeforeChangeHook<Booking> = async ({
  data,
  originalDoc,
  req,
}) => {
  const staff = data.staff ?? originalDoc?.staff
  const service = data.service ?? originalDoc?.service

  if (staff == null || service == null) return

  const staffId = typeof staff === 'number' ? staff : staff.id

  const fullStaff = await req.payload.findByID({
    collection: 'staff',
    id: staffId,
    depth: 0,
    req,
  })

  try {
    checkStaffOffersService({ staff: fullStaff, service })
  } catch (error) {
    // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
    let message = req.t('custom:errorUnknown')

    if (error instanceof Error) {
      if (error.cause === 'incomplete') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:errorIncompleteData')
      } else if (error.cause === 'invalid') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:bookingStaffNotOffersService')
      }
    }

    throw new ValidationError({
      errors: [{ path: 'staff', message }],
    })
  }
}
