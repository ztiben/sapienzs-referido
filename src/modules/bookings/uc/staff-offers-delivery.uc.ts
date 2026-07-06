import type { Booking } from '@/payload-types'
import { ValidationError, type CollectionBeforeChangeHook } from 'payload'
import { checkStaffOffersDelivery } from '../bl/staff-offers-delivery.bl'

export const checkStaffOffersDeliveryBeforeChange: CollectionBeforeChangeHook<Booking> = async ({
  data,
  originalDoc,
  req,
}) => {
  const staff = data.staff ?? originalDoc?.staff
  const modality = data.modality ?? originalDoc?.modality

  if (modality !== 'delivery' || staff == null) return

  const staffId = typeof staff === 'number' ? staff : staff.id

  const fullStaff = await req.payload.findByID({
    collection: 'staff',
    id: staffId,
    depth: 0,
    req,
  })

  try {
    checkStaffOffersDelivery({ staff: fullStaff })
  } catch (error) {
    // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
    let message = req.t('custom:errorUnknown')

    if (error instanceof Error) {
      if (error.cause === 'incomplete') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:errorIncompleteData')
      } else if (error.cause === 'invalid') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:bookingStaffNotOffersDelivery')
      }
    }

    throw new ValidationError({
      errors: [{ path: 'staff', message }],
    })
  }
}
