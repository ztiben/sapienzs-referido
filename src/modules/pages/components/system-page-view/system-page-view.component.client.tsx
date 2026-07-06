'use client'

import type { DocumentViewClientProps } from 'payload'

import { Banner, DefaultEditView, Gutter, useDocumentInfo, useTranslation } from '@payloadcms/ui'
import React from 'react'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''

export const SystemPageView: React.FC<DocumentViewClientProps> = (props) => {
  const { initialData } = useDocumentInfo()
  const { t } = useTranslation()

  if (!initialData?.isSystemPage) {
    return <DefaultEditView {...props} />
  }

  const url = `${baseUrl}/${initialData.slug}`

  return (
    <div style={{ marginTop: 60 }}>
      <Gutter>
        <Banner type="info">
          {/* @ts-expect-error custom translation key not in Payload's generated union */}
          <strong>{t('custom:systemPageTitle')}</strong>
          <br />
          {/* @ts-expect-error custom translation key not in Payload's generated union */}
          {t('custom:systemPageDescriptionPrefix')}{' '}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
          {/* @ts-expect-error custom translation key not in Payload's generated union */}
          {t('custom:systemPageDescriptionSuffix')}
        </Banner>
      </Gutter>
    </div>
  )
}
