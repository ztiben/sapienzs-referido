'use client'

import { InstagramIcon } from '@/shared/components/icons/instagram/instagram.component'
import { Media } from '@/shared/components/media/media.component'
import { Price } from '@/shared/components/price/price.component'
import Link from 'next/link'
import React from 'react'

import type { ParsedInstagramPost } from '../instagram-feed-block/instagram-feed-block.component'

import { useInstagramFeedCard } from './use-instagram-feed-card'

const InstagramFeedCard: React.FC<{ post: ParsedInstagramPost }> = ({ post }) => {
  const { isLoaded, setIsLoaded, profileUrl, displayHandle, image, item } =
    useInstagramFeedCard(post)

  return (
    <div className="flex flex-col">
      {/* Instagram embed with @handle overlay */}
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-base-200"
        style={{ aspectRatio: '1 / 1' }}
      >
        {!isLoaded && <div className="absolute inset-0 animate-pulse bg-base-300" />}
        <iframe
          allow="encrypted-media"
          className="absolute left-0 border-0"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          src={post.embedUrl}
          style={{
            top: '-54px',
            width: '100%',
            height: 'calc(100% + 200px)',
          }}
          title={`Instagram ${post.type === 'reel' ? 'Reel' : 'Post'} by ${displayHandle ?? post.shortcode}`}
        />

        {/* @handle overlay — bottom-left, above the Instagram content */}
        {displayHandle && (
          <a
            className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            href={profileUrl}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <InstagramIcon />
            {displayHandle}
          </a>
        )}
      </div>

      {/* Product info row */}
      <Link
        className="mt-3 flex items-center justify-between gap-3"
        href={`/${item.collection}/${item.slug}`}
      >
        {image && (
          <Media
            className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-base-200"
            imgClassName="h-full w-full object-cover"
            resource={image}
          />
        )}

        <div className="min-w-0 flex-1">
          {typeof item.price === 'number' && (
            <Price
              amount={item.price}
              as="p"
              className="text-sm font-semibold text-base-content"
              currencyCode={item.currency}
            />
          )}
          <p className="truncate text-sm text-base-content/70">{item.title}</p>
        </div>
      </Link>
    </div>
  )
}

export const InstagramFeedClient: React.FC<{ posts: ParsedInstagramPost[] }> = ({ posts }) => {
  if (!posts?.length) return null

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <InstagramFeedCard key={post.shortcode} post={post} />
      ))}
    </div>
  )
}
