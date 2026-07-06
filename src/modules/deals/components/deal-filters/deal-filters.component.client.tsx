'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

import { useDealFilters } from './use-deal-filters'

type Option = {
  label: string
  value: string
}

type Props = {
  retailers: Option[]
  categories: Option[]
}

export const DealFilters: React.FC<Props> = ({ retailers, categories }) => {
  const { retailer, category, hasFilters, setFilter, clearFilters } = useDealFilters()
  const t = useTranslations('deals')

  return (
    <div className="flex flex-wrap items-center gap-3">
      {retailers.length > 0 && (
        <Select onValueChange={(value) => setFilter('retailer', value)} value={retailer}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('filterByRetailer')} />
          </SelectTrigger>
          <SelectContent>
            {retailers.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {categories.length > 0 && (
        <Select onValueChange={(value) => setFilter('category', value)} value={category}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('filterByCategory')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button onClick={clearFilters} size="sm" type="button" variant="ghost">
          {t('clearFilters')}
        </Button>
      )}
    </div>
  )
}
