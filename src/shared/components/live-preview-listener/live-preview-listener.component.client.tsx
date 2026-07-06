'use client'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import React from 'react'

import { useLivePreviewListener } from './use-live-preview-listener'

export const LivePreviewListener: React.FC = () => {
  const { refresh, serverURL } = useLivePreviewListener()
  return <PayloadLivePreview refresh={refresh} serverURL={serverURL} />
}
