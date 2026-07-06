import type { Booking } from '@/payload-types'
import { ValidationError, type CollectionBeforeChangeHook } from 'payload'
import { checkStaffAssignedToStore } from '../bl/staff-assigned-to-store.bl'

export const checkStaffAssignedToStoreBeforeChange: CollectionBeforeChangeHook<Booking> = async ({
  data,
  originalDoc,
  req,
}) => {
  const staff = data.staff ?? originalDoc?.staff
  const store = data.store ?? originalDoc?.store
  const modality = data.modality ?? originalDoc?.modality

  if (staff == null || store == null || modality !== 'inStore') return

  const staffId = typeof staff === 'number' ? staff : staff.id

  const fullStaff = await req.payload.findByID({
    collection: 'staff',
    id: staffId,
    depth: 0,
    req,
  })

  try {
    checkStaffAssignedToStore({ staff: fullStaff, store })
  } catch (error) {
    // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
    let message = req.t('custom:errorUnknown')

    if (error instanceof Error) {
      if (error.cause === 'incomplete') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:errorIncompleteData')
      } else if (error.cause === 'invalid') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:bookingStaffNotAssignedToStore')
      }
    }

    throw new ValidationError({
      errors: [{ path: 'staff', message }],
    })
  }
}
