import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/shared/components/link/link.component'
import { Media } from '@/shared/components/media/media.component'
import { RichText } from '@/modules/pages/components/rich-text/rich-text.component'
import { cn } from '@/shared/utils/cn.util'
import { alignToFlex, getRichTextAlignment } from '@/shared/utils/rich-text-alignment.util'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, mediaMobile, richText }) => {
  const alignment = getRichTextAlignment(richText)

  return (
    <div className="relative -mt-16 aspect-[9/16] md:aspect-video flex items-center justify-center overflow-hidden text-white">
      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="w-full">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className={cn('flex gap-4', alignToFlex[alignment] ?? 'justify-start')}>
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      {media && typeof media === 'object' && (
        <div className="absolute inset-0 select-none hidden md:block">
          <Media
            fill
            imgClassName="object-cover"
            priority
            resource={media}
            videoClassName="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}
      <div className="absolute inset-0 select-none md:hidden">
        <Media
          fill
          imgClassName="object-cover"
          priority
          resource={mediaMobile && typeof mediaMobile === 'object' ? mediaMobile : media ?? undefined}
          videoClassName="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
