'use client'
import type { Category } from '@/payload-types'

import clsx from 'clsx'
import React from 'react'

import { useCategoryItem } from './use-category-item'

type Props = {
  category: Category
}

export const CategoryItem: React.FC<Props> = ({ category }) => {
  const { isActive, setQuery } = useCategoryItem(category)

  return (
    <li className="mt-2 flex text-sm text-base-content/50">
      <button
        onClick={() => setQuery()}
        className={clsx(
          'w-full text-left hover:cursor-pointer hover:underline hover:underline-offset-4',
          {
            'underline underline-offset-4': isActive,
          },
        )}
      >
        {category.title}
      </button>
    </li>
  )
}
