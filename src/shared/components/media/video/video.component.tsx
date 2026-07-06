'use client'

import { cn } from '@/shared/utils/cn.util'
import React from 'react'

import type { Props as MediaProps } from '../media.model'

import { useVideo } from './use-video'

export const Video: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props
  const { videoRef } = useVideo()

  if (resource && typeof resource === 'object') {
    const { filename } = resource

    return (
      <video
        autoPlay
        className={cn(videoClassName)}
        controls={false}
        loop
        muted
        onClick={onClick}
        playsInline
        ref={videoRef}
      >
        <source
          src={`${encodeURI(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/media/file/${filename}`)}`}
        />
      </video>
    )
  }

  return null
}
