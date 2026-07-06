import {
  checkNoDatetimeOverlapBlockBeforeChange,
  checkNoDatetimeOverlapBookingBeforeChange,
} from '@/modules/bookings/uc/datetime-overlap.uc'
import { checkStaffAssignedToStoreBeforeChange } from '@/modules/bookings/uc/staff-assigned-to-store.uc'
import { checkStaffOffersDeliveryBeforeChange } from '@/modules/bookings/uc/staff-offers-delivery.uc'
import { checkStaffOffersServiceBeforeChange } from '@/modules/bookings/uc/staff-offers-service.uc'
import { checkStaffScheduleBeforeChange } from '@/modules/bookings/uc/staff-schedule.uc'
import { checkStoreOffersServiceBeforeChange } from '@/modules/bookings/uc/store-offers-service.uc'
import { Booking } from '@/payload-types'
import { type CollectionBeforeChangeHook } from 'payload'

export const checkBusinessLogic: CollectionBeforeChangeHook<Booking> = async (params) => {
  await Promise.all([
    checkStoreOffersServiceBeforeChange(params),
    checkStaffOffersServiceBeforeChange(params),
    checkStaffAssignedToStoreBeforeChange(params),
    checkStaffOffersDeliveryBeforeChange(params),
    checkNoDatetimeOverlapBookingBeforeChange(params),
    checkNoDatetimeOverlapBlockBeforeChange(params),
    checkStaffScheduleBeforeChange(params),
  ])
}
