import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/shared/components/link/link.component'
import { RichText } from '@/modules/pages/components/rich-text/rich-text.component'
import { cn } from '@/shared/utils/cn.util'
import { alignToFlex, getRichTextAlignment } from '@/shared/utils/rich-text-alignment.util'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, richText }) => {
  const alignment = getRichTextAlignment(richText)

  return (
    <div className="w-full">
      <div className="container mb-8">
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
  )
}
