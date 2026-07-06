import type { Booking } from '@/payload-types'

type Params = Pick<Booking, 'store' | 'service'>

export const checkStoreOffersService = ({ store, service }: Params): void => {
  if (!store || typeof store === 'number') throw new Error(undefined, { cause: 'incomplete' })

  const serviceId = typeof service === 'number' ? service : service.id

  const storeOffersService = store.services?.some((s) => {
    const serviceIdToCheck = typeof s === 'number' ? s : s.id
    return serviceIdToCheck === serviceId
  })

  if (!storeOffersService) {
    throw new Error(undefined, {
      cause: 'invalid',
    })
  }
}
