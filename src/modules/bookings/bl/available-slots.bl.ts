import type { Booking, Service, Staff, StaffBlock } from '@/payload-types'
import { DAYS_OF_WEEK } from '@/shared/constants/days-of-week.constants'
import { DEFAULT_BUFFER_MINUTES } from '../constants/services.constants'
import {
  DEFAULT_WORK_DAYS,
  DEFAULT_WORK_END_HOUR,
  DEFAULT_WORK_START_HOUR,
} from '../constants/staff.constants'
import type { ServiceSlot } from '../models/booking.model'

const MINUTES_PER_DAY = 1440
const MS_PER_MINUTE = 60_000

const getDayOfWeek = (date: Date) => DAYS_OF_WEEK[date.getUTCDay()]

const getMinutesOfDayUtc = (time: string): number => {
  const d = new Date(time)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

interface GetAvailableSlotsArgs {
  durationMinutes: Service['durationMinutes']
  bufferMinutes: Service['bufferMinutes']
  workStartHour: Staff['workStartTime']
  workEndHour: Staff['workEndTime']
  workDays: Staff['workDays']
  date: Date
  blocks: StaffBlock[]
  bookings: Booking[]
}

export const getAvailableSlots = ({
  durationMinutes,
  bufferMinutes,
  workStartHour,
  workEndHour,
  workDays,
  date,
  blocks,
  bookings,
}: GetAvailableSlotsArgs): ServiceSlot[] => {
  const dayOfWeek = getDayOfWeek(date)
  if (!(workDays ?? DEFAULT_WORK_DAYS).includes(dayOfWeek)) return []

  const buffer = bufferMinutes ?? DEFAULT_BUFFER_MINUTES
  const stepMs = (durationMinutes + buffer) * MS_PER_MINUTE
  const durationMs = durationMinutes * MS_PER_MINUTE

  const workStartMin = getMinutesOfDayUtc(workStartHour ?? DEFAULT_WORK_START_HOUR)
  let workEndMin = getMinutesOfDayUtc(workEndHour ?? DEFAULT_WORK_END_HOUR)
  // Cross-midnight UTC: stored end is on the next UTC day (e.g. 20:00 Bogotá = 01:00Z+1).
  if (workEndMin <= workStartMin) workEndMin += MINUTES_PER_DAY

  const anchorMs = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const workStartMs = anchorMs + workStartMin * MS_PER_MINUTE
  const workEndMs = anchorMs + workEndMin * MS_PER_MINUTE

  const activeBlocks = blocks
    .filter((b) => b.repeat?.includes(dayOfWeek))
    .map((b) => {
      const startMin = getMinutesOfDayUtc(b.startTime)
      let endMin = getMinutesOfDayUtc(b.endTime)
      if (endMin <= startMin) endMin += MINUTES_PER_DAY
      return {
        startMs: anchorMs + startMin * MS_PER_MINUTE,
        endMs: anchorMs + endMin * MS_PER_MINUTE,
      }
    })
  const activeBookings = bookings.map((b) => ({
    startMs: new Date(b.startDatetime).getTime(),
    endMs: new Date(b.endDatetime).getTime(),
  }))

  const slots: ServiceSlot[] = []
  let currentMs = workStartMs

  while (currentMs + durationMs <= workEndMs) {
    const slotEndMs = currentMs + durationMs
    const overlappingBlock = activeBlocks.find(
      (b) => currentMs < b.endMs && slotEndMs > b.startMs,
    )
    if (overlappingBlock) {
      currentMs = overlappingBlock.endMs
      continue
    }
    const overlappingBooking = activeBookings.find(
      (b) => currentMs < b.endMs && slotEndMs > b.startMs,
    )
    if (overlappingBooking) {
      currentMs = overlappingBooking.endMs + buffer * MS_PER_MINUTE
      continue
    }
    slots.push(new Date(currentMs).toISOString())
    currentMs += stepMs
  }

  return slots
}
