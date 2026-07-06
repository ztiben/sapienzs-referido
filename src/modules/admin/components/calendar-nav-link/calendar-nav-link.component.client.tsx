'use client'

import { Link, NavGroup, useTranslation } from '@payloadcms/ui'

import { useCalendarNavLink } from './use-calendar-nav-link'

export const CalendarNavLinkClient = () => {
  const { href, isActive } = useCalendarNavLink()
  const { t } = useTranslation()

  return (
    // @ts-expect-error custom translation key not in Payload's generated union
    <NavGroup label={t('custom:calendar')}>
      <Link
        href={href}
        className="nav__link"
        id="nav-calendar"
        style={{
          cursor: isActive ? 'none' : 'pointer',
          pointerEvents: isActive ? 'none' : 'auto',
        }}
      >
        {isActive && <div className="nav__link-indicator" />}
        {/* @ts-expect-error custom translation key not in Payload's generated union */}
        <span className="nav__link-label">{t('custom:calendar')}</span>
      </Link>
    </NavGroup>
  )
}
