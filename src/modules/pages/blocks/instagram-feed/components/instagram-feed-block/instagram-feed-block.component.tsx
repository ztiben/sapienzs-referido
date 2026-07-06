import type { DisplayItem } from '@/shared/utils/to-display-item.util'
import type {
  InstagramFeedBlock as InstagramFeedBlockProps,
  Product,
  Service,
} from '@/payload-types'

import { toDisplayItem } from '@/shared/utils/to-display-item.util'
import type { DefaultDocumentIDType } from 'payload'
import React from 'react'

import { InstagramFeedClient } from '../instagram-feed/instagram-feed.component.client'

export type ParsedInstagramPost = {
  shortcode: string
  type: 'p' | 'reel'
  embedUrl: string
  originalUrl: string
  handle?: string | null
  item: DisplayItem
}

function parseInstagramUrl(url: string): { shortcode: string; type: 'p' | 'reel' } | null {
  const match = url.match(/instagram\.com\/(p|reel)\/([\w-]+)/)
  if (!match) return null
  return {
    type: match[1] as 'p' | 'reel',
    shortcode: match[2],
  }
}

export const InstagramFeedBlock: React.FC<
  InstagramFeedBlockProps & { id?: DefaultDocumentIDType }
> = (props) => {
  const { posts } = props

  if (!posts?.length) return null

  const parsedPosts: ParsedInstagramPost[] = []
  for (const post of posts) {
    const parsed = parseInstagramUrl(post.url)
    if (!parsed) continue

    const { linkedDoc } = post
    if (!linkedDoc || typeof linkedDoc.value !== 'object') continue

    const collection = linkedDoc.relationTo as 'products' | 'services'
    const item = toDisplayItem(linkedDoc.value as Product | Service, collection)

    parsedPosts.push({
      shortcode: parsed.shortcode,
      type: parsed.type,
      embedUrl: `https://www.instagram.com/${parsed.type}/${parsed.shortcode}/embed/`,
      originalUrl: post.url,
      handle: post.handle ?? undefined,
      item,
    })
  }

  if (parsedPosts.length === 0) return null

  return (
    <div className="container">
      <InstagramFeedClient posts={parsedPosts} />
    </div>
  )
}
