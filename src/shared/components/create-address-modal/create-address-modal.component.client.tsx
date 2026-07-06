'use client'
import type { Address } from '@/payload-types'

import { AddressForm } from '@/shared/components/address-form/address-form.component.client'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { DefaultDocumentIDType } from 'payload'
import React from 'react'

import { useCreateAddressModal } from './use-create-address-modal'

type Props = {
  addressID?: DefaultDocumentIDType
  initialData?: Partial<Omit<Address, 'country'>> & { country?: string }
  buttonText?: string
  modalTitle?: string
  callback?: (address: Partial<Address>) => void
  skipSubmission?: boolean
  disabled?: boolean
}

export const CreateAddressModal: React.FC<Props> = ({
  addressID,
  initialData,
  buttonText,
  modalTitle,
  callback,
  skipSubmission,
  disabled,
}) => {
  const t = useTranslations('address')
  const { open, onOpenChange, handleCallback } = useCreateAddressModal(callback)
  const defaultButtonText = buttonText ?? t('addNew')
  const defaultModalTitle = modalTitle ?? t('addNew')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild disabled={disabled}>
        <Button variant={'outline'}>{defaultButtonText}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultModalTitle}</DialogTitle>
          <DialogDescription>{t('connectedToAccount')}</DialogDescription>
        </DialogHeader>

        <AddressForm
          addressID={addressID}
          initialData={initialData}
          callback={handleCallback}
          skipSubmission={skipSubmission}
        />
      </DialogContent>
    </Dialog>
  )
}
