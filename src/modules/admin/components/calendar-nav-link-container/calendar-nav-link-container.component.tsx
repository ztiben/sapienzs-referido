import { features } from '@/infrastructure/features'
import { CalendarNavLinkClient } from '../calendar-nav-link/calendar-nav-link.component.client'

export const CalendarNavLinkContainer = () => {
  if (!features.services) return null
  return <CalendarNavLinkClient />
}
