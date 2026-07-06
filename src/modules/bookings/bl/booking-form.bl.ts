import type { Booking, Service, Store } from '@/payload-types'

export type Modality = Booking['modality']

export type BookingFormState = {
  modality: Modality | undefined
  storeId: number | undefined
  staffId: number | undefined
  selectedDate: Date | undefined
  selectedSlot: string | undefined
  hasAddress: boolean
}

export type TimeSlotOption = {
  value: string
  label: string
}

export const getSupportedModalities = (service: Service): Modality[] =>
  (service.modalities ?? []) as Modality[]

export const getInStoreStores = (service: Service, modality: Modality | undefined): Store[] => {
  if (modality !== 'inStore') return []
  return (service.stores?.docs ?? []).filter((s): s is Store => typeof s === 'object')
}

export const buildStaffQuery = ({
  serviceId,
  modality,
  storeId,
}: {
  serviceId: number
  modality: Modality
  storeId: number | undefined
}): string => {
  let url = `/api/staff?where[services][in][]=${serviceId}`
  if (modality === 'inStore' && storeId) url += `&where[stores][in][]=${storeId}`
  if (modality === 'delivery') url += `&where[offersDelivery][equals]=true`
  return url
}

export const buildAvailabilityQuery = ({
  staffId,
  serviceId,
  date,
}: {
  staffId: number
  serviceId: number
  date: Date
}): string =>
  `/api/staff/${staffId}/availability?service=${serviceId}&date=${encodeURIComponent(date.toISOString())}`

export const formatTimeSlots = (slots: string[]): TimeSlotOption[] =>
  slots.map((iso) => ({
    value: iso,
    label: new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }),
  }))

export const canSubmitBooking = (state: BookingFormState): boolean => {
  const { modality, storeId, staffId, selectedDate, selectedSlot, hasAddress } = state
  return (
    modality != null &&
    staffId != null &&
    selectedDate != null &&
    selectedSlot != null &&
    (modality !== 'inStore' || storeId != null) &&
    (modality !== 'delivery' || hasAddress)
  )
}

export const buildBookingBody = ({
  serviceId,
  modality,
  staffId,
  storeId,
  addressId,
  selectedSlot,
}: {
  serviceId: number
  modality: NonNullable<Modality>
  staffId: number
  storeId: number | undefined
  addressId: number | undefined
  selectedSlot: string
}): Partial<Booking> => {
  const body: Partial<Booking> = {
    service: serviceId,
    staff: staffId,
    modality,
    startDatetime: selectedSlot,
  }
  if (modality === 'inStore') body.store = storeId
  if (modality === 'delivery') body.address = addressId
  return body
}
