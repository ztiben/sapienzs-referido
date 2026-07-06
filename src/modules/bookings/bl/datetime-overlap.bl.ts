import type { Booking, StaffBlock } from '@/payload-types'
import { DAYS_OF_WEEK } from '@/shared/constants/days-of-week.constants'

const parseTimeToMinutes = (time: string): number => {
  const date = new Date(time)
  return date.getUTCHours() * 60 + date.getUTCMinutes()
}

type CheckNoDatetimeOverlapBookingParams = {
  existingBookings: Booking[]
  newStartDatetime: Booking['startDatetime']
  newEndDatetime: Booking['endDatetime']
}

export const checkNoDatetimeOverlapBooking = ({
  existingBookings,
  newStartDatetime,
  newEndDatetime,
}: CheckNoDatetimeOverlapBookingParams): void => {
  const newStart = new Date(newStartDatetime).getTime()
  const newEnd = new Date(newEndDatetime).getTime()

  const hasOverlap = existingBookings.some((booking) => {
    const existingStart = new Date(booking.startDatetime).getTime()
    const existingEnd = new Date(booking.endDatetime).getTime()
    return existingStart < newEnd && newStart < existingEnd
  })

  if (hasOverlap) {
    throw new Error(undefined, { cause: 'invalid' })
  }
}

type CheckNoDatetimeOverlapBlockParams = {
  blocks: StaffBlock[]
  startDatetime: Booking['startDatetime']
  endDatetime: Booking['endDatetime']
}

export const checkNoDatetimeOverlapBlock = ({
  blocks,
  startDatetime,
  endDatetime,
}: CheckNoDatetimeOverlapBlockParams): void => {
  const bookingDate = new Date(startDatetime)
  const dayOfWeek = DAYS_OF_WEEK[bookingDate.getUTCDay()]
  const bookingStartMinutes = parseTimeToMinutes(startDatetime)
  const bookingEndMinutes = parseTimeToMinutes(endDatetime)

  const hasOverlap = blocks.some((block) => {
    if (!block.repeat?.includes(dayOfWeek)) return false
    const blockStart = parseTimeToMinutes(block.startTime)
    const blockEnd = parseTimeToMinutes(block.endTime)
    return bookingStartMinutes < blockEnd && bookingEndMinutes > blockStart
  })

  if (hasOverlap) {
    throw new Error(undefined, { cause: 'invalid' })
  }
}
