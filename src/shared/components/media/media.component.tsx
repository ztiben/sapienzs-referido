import React, { Fragment } from 'react'

import type { Props } from './media.model'

import { Image } from './image/image.component'
import { Video } from './video/video.component'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {isVideo ? (
        <Video {...props} />
      ) : (
        // eslint-disable-next-line jsx-a11y/alt-text -- alt is resolved and applied inside the Image wrapper
        <Image {...props} />
      )}
    </Tag>
  )
}
