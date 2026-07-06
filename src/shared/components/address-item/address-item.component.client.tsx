'use client'

import type { Address } from '@/payload-types'
import { CreateAddressModal } from '@/shared/components/create-address-modal/create-address-modal.component.client'
import { useTranslations } from 'next-intl'
import React from 'react'

type Props = {
  address: Partial<Omit<Address, 'country'>> & { country?: string } // Allow address to be partial and entirely optional as this is entirely for display purposes
  /**
   * Completely override the default actions
   */
  actions?: React.ReactNode
  /**
   * Insert elements before the actions
   */
  beforeActions?: React.ReactNode
  /**
   * Insert elements after the actions
   */
  afterActions?: React.ReactNode
  /**
   * Hide all actions
   */
  hideActions?: boolean
}

export const AddressItem: React.FC<Props> = ({
  address,
  actions,
  hideActions = false,
  beforeActions,
  afterActions,
}) => {
  const t = useTranslations('address')
  if (!address) {
    return null
  }

  return (
    <div className="flex items-center">
      <div className="grow">
        <p className="font-medium">{address.name}</p>
        <p>{address.company && <span>{address.company} </span>}</p>
        <p>{address.phone && <span>{address.phone}</span>}</p>
        <p>{address.addressLine1}</p>
        <p>
          {address.city}
          {address.postalCode && <>, {address.postalCode}</>}
        </p>
        <p>{address.country}</p>
      </div>

      {!hideActions && address.id && (
        <div className="shrink flex flex-col gap-2">
          {actions ? (
            actions
          ) : (
            <>
              {beforeActions}
              {address.id && (
                <CreateAddressModal
                  addressID={address.id}
                  initialData={address}
                  buttonText={t('edit')}
                  modalTitle={t('editAddress')}
                />
              )}
              {afterActions}
            </>
          )}
        </div>
      )}
    </div>
  )
}
