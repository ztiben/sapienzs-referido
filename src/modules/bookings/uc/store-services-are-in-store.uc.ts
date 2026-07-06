import type { Store } from '@/payload-types'
import { ValidationError, type CollectionBeforeChangeHook } from 'payload'
import { checkServicesAreInStore } from '../bl/services-are-in-store.bl'

export const checkServicesAreInStoreBeforeChange: CollectionBeforeChangeHook<Store> = async ({
  data,
  req,
}) => {
  const serviceIds: number[] = (data.services ?? []).map((s) => (typeof s === 'number' ? s : s.id))

  if (serviceIds.length === 0) return

  const { docs: services } = await req.payload.find({
    collection: 'services',
    where: { id: { in: serviceIds } },
    depth: 0,
    req,
  })

  try {
    checkServicesAreInStore({ services })
  } catch (error) {
    // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
    let message = req.t('custom:errorUnknown')

    if (error instanceof Error && error.cause === 'invalid') {
      // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
      message = req.t('custom:storeServicesNotSupportInStore')
    }

    throw new ValidationError({
      errors: [{ path: 'services', message }],
    })
  }
}
