import type { Booking } from '@/payload-types'

type Params = Pick<Booking, 'staff'>

export const checkStaffOffersDelivery = ({ staff }: Params): void => {
  if (!staff || typeof staff === 'number') throw new Error(undefined, { cause: 'incomplete' })
  if (!staff.offersDelivery) throw new Error(undefined, { cause: 'invalid' })
}
