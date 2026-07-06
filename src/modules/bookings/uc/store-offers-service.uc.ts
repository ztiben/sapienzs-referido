import type { Booking } from '@/payload-types'
import { ValidationError, type CollectionBeforeChangeHook } from 'payload'
import { checkStoreOffersService } from '../bl/store-offers-service.bl'

export const checkStoreOffersServiceBeforeChange: CollectionBeforeChangeHook<Booking> = async ({
  data,
  originalDoc,
  req,
}) => {
  const store = data.store ?? originalDoc?.store
  const service = data.service ?? originalDoc?.service
  const modality = data.modality ?? originalDoc?.modality

  if (store == null || service == null || modality !== 'inStore') return

  const storeId = typeof store === 'number' ? store : store.id

  const fullStore = await req.payload.findByID({
    collection: 'stores',
    id: storeId,
    depth: 0,
    req,
  })

  try {
    checkStoreOffersService({ store: fullStore, service })
  } catch (error) {
    // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
    let message = req.t('custom:errorUnknown')

    if (error instanceof Error) {
      if (error.cause === 'incomplete') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:errorIncompleteData')
      } else if (error.cause === 'invalid') {
        // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
        message = req.t('custom:bookingStoreNotOffersService')
      }
    }

    throw new ValidationError({
      errors: [{ path: 'store', message }],
    })
  }
}
