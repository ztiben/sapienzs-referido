import { usePathname } from 'next/navigation'

export const useCalendarNavLink = () => {
  const pathname = usePathname()
  const href = '/admin/calendar'
  const isActive = pathname.includes(href)

  return { href, isActive }
}
