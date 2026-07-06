import type { Media as MediaType } from '@/payload-types'

import { useState } from 'react'

import type { ParsedInstagramPost } from '../instagram-feed-block/instagram-feed-block.component'

export const useInstagramFeedCard = (post: ParsedInstagramPost) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const { item } = post

  const profileUrl = post.handle
    ? `https://www.instagram.com/${post.handle.replace('@', '')}/`
    : post.originalUrl

  const displayHandle = post.handle
    ? post.handle.startsWith('@')
      ? post.handle
      : `@${post.handle}`
    : null

  const image = item.image && typeof item.image !== 'number' ? (item.image as MediaType) : null

  return { isLoaded, setIsLoaded, profileUrl, displayHandle, image, item }
}
