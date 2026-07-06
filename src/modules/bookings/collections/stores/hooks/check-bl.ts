import { checkServicesAreInStoreBeforeChange } from '@/modules/bookings/uc/store-services-are-in-store.uc'
import { Store } from '@/payload-types'
import { type CollectionBeforeChangeHook } from 'payload'

export const checkBusinessLogic: CollectionBeforeChangeHook<Store> = async (params) => {
  await Promise.all([checkServicesAreInStoreBeforeChange(params)])
}
