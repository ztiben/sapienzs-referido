import type { Booking } from '@/payload-types'
import { DAYS_OF_WEEK } from '@/shared/constants/days-of-week.constants'
import {
  DEFAULT_WORK_DAYS,
  DEFAULT_WORK_END_HOUR,
  DEFAULT_WORK_START_HOUR,
} from '../constants/staff.constants'

type Params = Pick<Booking, 'staff' | 'startDatetime'>

const MS_PER_MINUTE = 60_000
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE
const MINUTES_PER_DAY = 1440

const getMinutesOfDayUtc = (time: string): number => {
  const d = new Date(time)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

export const checkStaffSchedule = ({ staff, startDatetime }: Params): void => {
  if (!staff || typeof staff === 'number') throw new Error(undefined, { cause: 'incomplete' })

  const workDays = staff.workDays?.length ? staff.workDays : DEFAULT_WORK_DAYS
  const workStartMin = getMinutesOfDayUtc(staff.workStartTime ?? DEFAULT_WORK_START_HOUR)
  let workEndMin = getMinutesOfDayUtc(staff.workEndTime ?? DEFAULT_WORK_END_HOUR)
  // Cross-midnight UTC: stored end is on the next UTC day (e.g. 20:00 Bogotá = 01:00Z+1).
  if (workEndMin <= workStartMin) workEndMin += MINUTES_PER_DAY

  const bookingMs = new Date(startDatetime).getTime()
  const utcMidnightMs = Date.UTC(
    new Date(startDatetime).getUTCFullYear(),
    new Date(startDatetime).getUTCMonth(),
    new Date(startDatetime).getUTCDate(),
  )

  // The booking's UTC date may be either the workday's anchor day or the next
  // day (when the workday crosses midnight UTC). Try both.
  const fitsAnchor = (anchorMs: number): boolean => {
    const dayOfWeek = DAYS_OF_WEEK[new Date(anchorMs).getUTCDay()]
    if (!workDays.includes(dayOfWeek)) return false
    const workStartMs = anchorMs + workStartMin * MS_PER_MINUTE
    const workEndMs = anchorMs + workEndMin * MS_PER_MINUTE
    return bookingMs >= workStartMs && bookingMs < workEndMs
  }

  if (!fitsAnchor(utcMidnightMs) && !fitsAnchor(utcMidnightMs - MS_PER_DAY)) {
    throw new Error(undefined, { cause: 'invalid' })
  }
}
