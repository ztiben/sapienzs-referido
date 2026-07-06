import type { Booking } from '@/payload-types'

type Params = Pick<Booking, 'staff' | 'service'>

export const checkStaffOffersService = ({ staff, service }: Params): void => {
  if (!staff || typeof staff === 'number') throw new Error(undefined, { cause: 'incomplete' })

  const serviceId = typeof service === 'number' ? service : service.id

  const staffOffersService = staff.services?.some((s) => {
    const serviceIdToCheck = typeof s === 'number' ? s : s.id
    return serviceIdToCheck === serviceId
  })

  if (!staffOffersService) {
    throw new Error(undefined, { cause: 'invalid' })
  }
}
