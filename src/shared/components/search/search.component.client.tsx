'use client'

import { cn } from '@/shared/utils/cn.util'
import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

import { useSearch } from './use-search'

type Props = {
  className?: string
}

export const Search: React.FC<Props> = ({ className }) => {
  const { query, onSubmit } = useSearch()
  const t = useTranslations('deals')

  return (
    <form className={cn('relative w-full', className)} onSubmit={onSubmit}>
      <input
        autoComplete="off"
        className="w-full rounded-lg border px-4 py-2 text-sm text-base-content placeholder:text-base-content/50"
        defaultValue={query}
        key={query}
        name="search"
        placeholder={t('searchPlaceholder')}
        type="text"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <SearchIcon className="h-4" />
      </div>
    </form>
  )
}
