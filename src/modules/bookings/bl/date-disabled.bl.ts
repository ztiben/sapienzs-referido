import type { Service, Staff } from '@/payload-types'
import { DAYS_OF_WEEK } from '@/shared/constants/days-of-week.constants'
import { DEFAULT_WORK_DAYS } from '../constants/staff.constants'

export const checkDateDisabled = (date: Date, _service: Service, staff: Partial<Staff>): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date < today) return true

  const workDays = staff.workDays?.length ? staff.workDays : DEFAULT_WORK_DAYS
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()]
  return !(workDays as string[]).includes(dayOfWeek)
}
