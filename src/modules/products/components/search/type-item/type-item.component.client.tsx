'use client'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import React from 'react'

import { useTypeItem } from './use-type-item'

type ShopType = { id: string; title: string }

type Props = {
  shopType: ShopType
  defaultShopType: string
}

export const TypeFilterItem: React.FC<Props> = ({ shopType, defaultShopType }) => {
  const { isActive, setQuery } = useTypeItem(shopType, defaultShopType)
  const t = useTranslations('shop')

  return (
    <li className="mt-2 flex text-sm">
      <button
        onClick={() => setQuery()}
        className={clsx(
          'w-full text-left hover:cursor-pointer hover:underline hover:underline-offset-4',
          {
            'underline underline-offset-4': isActive,
          },
        )}
      >
        {t(shopType.title as Parameters<typeof t>[0])}
      </button>
    </li>
  )
}
