'use client'

import { AddressItem } from '@/shared/components/address-item/address-item.component.client'
import { useTranslations } from 'next-intl'
import React from 'react'

import { useAddressListing } from './use-address-listing'

export const AddressListing: React.FC = () => {
  const { addresses } = useAddressListing()
  const t = useTranslations('address')

  if (!addresses || addresses.length === 0) {
    return <p>{t('noAddresses')}</p>
  }

  return (
    <div>
      <ul className="flex flex-col gap-8">
        {addresses.map((address) => (
          <li key={address.id} className="border-b pb-8 last:border-none">
            <AddressItem address={address} />
          </li>
        ))}
      </ul>
    </div>
  )
}
