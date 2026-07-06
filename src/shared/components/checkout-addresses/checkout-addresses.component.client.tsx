'use client'

import { AddressItem } from '@/shared/components/address-item/address-item.component.client'
import { Address } from '@/payload-types'
import { CreateAddressModal } from '@/shared/components/create-address-modal/create-address-modal.component.client'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { useTranslations } from 'next-intl'
import React from 'react'

import { useAddressesModal, useCheckoutAddresses } from './use-checkout-addresses'

type Props = {
  selectedAddress?: Address
  setAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  heading?: string
  description?: string
  setSubmit?: React.Dispatch<React.SetStateAction<() => void | Promise<void>>>
}

export const CheckoutAddresses: React.FC<Props> = ({ setAddress, heading, description }) => {
  const { addresses } = useCheckoutAddresses()
  const t = useTranslations('checkout')

  if (!addresses || addresses.length === 0) {
    return (
      <div>
        <p>{t('noAddresses')}</p>

        <CreateAddressModal />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-xl font-medium mb-2">{heading || t('address')}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <AddressesModal setAddress={setAddress} />
    </div>
  )
}

const AddressesModal: React.FC<Props> = ({ setAddress }) => {
  const { open, onOpenChange, closeModal, addresses } = useAddressesModal()
  const t = useTranslations('checkout')

  if (!addresses || addresses.length === 0) {
    return <p>{t('noAddresses')}</p>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{t('selectAddress')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('selectAddress')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-12">
          <ul className="flex flex-col gap-8">
            {addresses.map((address) => (
              <li key={address.id} className="border-b pb-8 last:border-none">
                <AddressItem
                  address={address}
                  beforeActions={
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        setAddress(address)
                        closeModal()
                      }}
                    >
                      {t('select')}
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>

          <CreateAddressModal />
        </div>
      </DialogContent>
    </Dialog>
  )
}
