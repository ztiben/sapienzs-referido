import { DefaultTemplate } from '@payloadcms/next/templates'
import type { AdminViewServerProps } from 'payload'

export const CalendarPage: React.FC<AdminViewServerProps> = ({
  initPageResult,
  params,
  searchParams,
}) => {
  const { req, locale, permissions, visibleEntities } = initPageResult

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <div />
    </DefaultTemplate>
  )
}
