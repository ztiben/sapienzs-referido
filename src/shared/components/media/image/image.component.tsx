'use client'

import { cn } from '@/shared/utils/cn.util'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../media.model'

import { useImage } from './use-image'

export const Image: React.FC<MediaProps> = (props) => {
  const { fill, imgClassName, onClick, priority, width: widthFromProps, height: heightFromProps } =
    props
  const { src, alt, width, height, sizes, handleLoad } = useImage(props)

  return (
    <NextImage
      alt={alt || ''}
      className={cn(imgClassName)}
      fill={fill}
      height={!fill ? height || heightFromProps : undefined}
      onClick={onClick}
      onLoad={handleLoad}
      priority={priority}
      quality={90}
      sizes={sizes}
      src={src}
      width={!fill ? width || widthFromProps : undefined}
    />
  )
}
