import { cn } from '@/shared/utils/cn.util'
import React from 'react'

import type { DisplayItem } from '@/shared/utils/to-display-item.util'
import { DealCard } from '@/shared/components/deal-card/deal-card.component'

export type Props = {
  posts: DisplayItem[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <DealCard item={item} />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
