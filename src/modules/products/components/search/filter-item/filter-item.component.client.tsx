'use client'

import type { SortFilterItem as SortFilterItemType } from '@/modules/products/models/search.model'

import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import React from 'react'

import type {
  ListItem,
  PathFilterItem as PathFilterItemType,
} from '../filter-list/filter-list.component'

import { usePathFilterItem, useSortFilterItem } from './use-filter-item'

const PathFilterItem: React.FC<{ item: PathFilterItemType }> = ({ item }) => {
  const { active, href, Tag } = usePathFilterItem(item)

  return (
    <li className="mt-2 flex" key={item.title}>
      <Tag
        className={clsx('w-full text-sm underline-offset-4 hover:underline text-base-content/50', {
          'underline underline-offset-4': active,
        })}
        href={href}
      >
        {item.title}
      </Tag>
    </li>
  )
}

const SortFilterItem: React.FC<{ item: SortFilterItemType }> = ({ item }) => {
  const { active, href, Tag } = useSortFilterItem(item)
  const t = useTranslations('shop')

  return (
    <li className="mt-2 flex text-sm" key={item.title}>
      <Tag
        className={clsx('w-full hover:underline hover:underline-offset-4 text-base-content/50', {
          'underline underline-offset-4': active,
        })}
        href={href}
        prefetch={!active ? false : undefined}
      >
        {t(item.title as Parameters<typeof t>[0])}
      </Tag>
    </li>
  )
}

export const FilterItem: React.FC<{ item: ListItem }> = ({ item }) => {
  return 'path' in item ? <PathFilterItem item={item} /> : <SortFilterItem item={item} />
}
