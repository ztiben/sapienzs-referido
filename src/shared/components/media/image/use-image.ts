import type { StaticImageData } from 'next/image'

import type { Props as MediaProps } from '../media.model'

export const useImage = (props: MediaProps) => {
  const {
    alt: altFromProps,
    height: heightFromProps,
    onLoad: onLoadFromProps,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    width: widthFromProps,
  } = props

  let width: null | number | undefined
  let height: null | number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, url, width: fullWidth } = resource

    width = widthFromProps ?? fullWidth
    height = heightFromProps ?? fullHeight
    alt = altFromResource
    src = `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`
  }

  // NOTE: used by the browser to pick which image to download per screen size.
  const sizes = sizeFromProps
    ? sizeFromProps
    : '(max-width: 1440px) 1440px, (max-width: 1024px) 1024px, (max-width: 768px) 768px'

  const handleLoad = () => {
    if (typeof onLoadFromProps === 'function') {
      onLoadFromProps()
    }
  }

  return { src, alt, width, height, sizes, handleLoad }
}
