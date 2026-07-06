'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

import type { ListItem } from '../filter-list/filter-list.component'

import { FilterItem } from '../filter-item/filter-item.component.client'
import { useFilterItemDropdown } from './use-filter-item-dropdown'

export const FilterItemDropdown: React.FC<{ list: ListItem[] }> = ({ list }) => {
  const { active, openSelect, setOpenSelect, ref } = useFilterItemDropdown(list)
  const t = useTranslations('shop')

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex w-full items-center justify-between rounded border px-4 py-2 text-sm"
        onClick={() => {
          setOpenSelect(!openSelect)
        }}
      >
        <div>{active ? t(active as Parameters<typeof t>[0]) : ''}</div>
        <ChevronDownIcon className="h-4" />
      </div>
      {openSelect && (
        <div
          className="absolute z-40 w-full rounded-b-md p-4 shadow-md"
          onClick={() => {
            setOpenSelect(false)
          }}
        >
          {list.map((item: ListItem, i) => (
            <FilterItem item={item} key={i} />
          ))}
        </div>
      )}
    </div>
  )
}
