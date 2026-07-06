// /**
//  * WhatsApp wrapper around domain availability.
//  *
//  * The domain layer returns clean Date / TimeSlot values. WhatsApp button
//  * payloads need compact string codes (YYYYMMDD / HHmm) — this layer adds them.
//  */
// import {
//   getAvailableDates as domainGetAvailableDates,
//   getAvailableSlots as domainGetAvailableSlots,
// } from '@/modules/bookings/domain/bookings/availability'
// import type { Service, Staff } from '@/payload-types'
// import type { Payload } from 'payload'
// import { encodeDateCode, encodeTimeCode } from './format'

// export interface AvailableDate {
//   date: Date
//   code: string // YYYYMMDD
// }

// export interface AvailableSlot {
//   hour: number
//   minute: number
//   code: string // HHmm
// }

// export function getAvailableDates(
//   staff: Staff,
//   service: Service,
//   maxDates: number = 10,
// ): AvailableDate[] {
//   return domainGetAvailableDates(staff, service, maxDates).map((date) => ({
//     date,
//     code: encodeDateCode(date),
//   }))
// }

// export async function getAvailableSlots(
//   payload: Payload,
//   staffId: number,
//   staff: Staff,
//   service: Service,
//   dateCode: string, // YYYYMMDD
// ): Promise<AvailableSlot[]> {
//   const year = parseInt(dateCode.slice(0, 4))
//   const month = parseInt(dateCode.slice(4, 6)) - 1
//   const day = parseInt(dateCode.slice(6, 8))
//   const localDate = new Date(year, month, day)

//   const slots = await domainGetAvailableSlots(payload, staffId, staff, service, localDate)
//   return slots.map((slot) => ({
//     hour: slot.hour,
//     minute: slot.minute,
//     code: encodeTimeCode(slot.hour, slot.minute),
//   }))
// }
