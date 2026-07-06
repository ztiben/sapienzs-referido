import { cn } from '@/shared/utils/cn.util'
import React from 'react'
import { RichText } from '@/modules/pages/components/rich-text/rich-text.component'
import type { DefaultDocumentIDType } from 'payload'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '@/shared/components/link/link.component'
import { alignToFlex, getRichTextAlignment } from '@/shared/utils/rich-text-alignment.util'

export const ContentBlock: React.FC<
  ContentBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {enableLink && (
                  <div className={cn('flex', alignToFlex[getRichTextAlignment(richText)] ?? 'justify-start')}>
                    <CMSLink {...link} />
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
