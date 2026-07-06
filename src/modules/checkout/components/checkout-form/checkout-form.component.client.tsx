'use client'

import type { Address } from '@/payload-types'

import { Message } from '@/shared/components/message/message.component'
import { Button } from '@/shared/components/ui/button'
import React from 'react'

import { PaymentElement, useCheckoutForm } from './use-checkout-form'

type Props = {
  customerEmail?: string
  billingAddress?: Partial<Address>
  shippingAddress?: Partial<Address>
  setProcessingPayment: React.Dispatch<React.SetStateAction<boolean>>
}

export const CheckoutForm: React.FC<Props> = ({
  customerEmail,
  billingAddress,
  setProcessingPayment,
}) => {
  const { stripe, error, isLoading, handleSubmit } = useCheckoutForm({
    customerEmail,
    billingAddress,
    setProcessingPayment,
  })

  return (
    <form onSubmit={handleSubmit}>
      {error && <Message error={error} />}
      <PaymentElement />
      <div className="mt-8 flex gap-4">
        <Button disabled={!stripe || isLoading} type="submit" variant="default">
          {isLoading ? 'Loading...' : 'Pay now'}
        </Button>
      </div>
    </form>
  )
}
