import type { Booking } from '@/payload-types'

type Params = Pick<Booking, 'staff' | 'store'>

export const checkStaffAssignedToStore = ({ staff, store }: Params): void => {
  if (!staff || typeof staff === 'number') throw new Error(undefined, { cause: 'incomplete' })
  if (store == null) throw new Error(undefined, { cause: 'incomplete' })

  const storeId = typeof store === 'number' ? store : store.id

  const staffAssignedToStore = staff.stores?.some((s) => {
    const storeIdToCheck = typeof s === 'number' ? s : s.id
    return storeIdToCheck === storeId
  })

  if (!staffAssignedToStore) {
    throw new Error(undefined, { cause: 'invalid' })
  }
}
