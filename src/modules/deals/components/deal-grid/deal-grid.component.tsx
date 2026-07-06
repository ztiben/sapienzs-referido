import React from 'react'

import { DealCard } from '@/shared/components/deal-card/deal-card.component'
import type { DisplayItem } from '@/shared/utils/to-display-item.util'

type Props = {
  items: DisplayItem[]
}

export const DealGrid: React.FC<Props> = ({ items }) => {
  if (!items.length) return null

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <DealCard item={item} key={item.slug} />
      ))}
    </div>
  )
}
