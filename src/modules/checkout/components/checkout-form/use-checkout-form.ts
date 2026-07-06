import type { Address } from '@/payload-types'

import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

type Params = {
  customerEmail?: string
  billingAddress?: Partial<Address>
  setProcessingPayment: React.Dispatch<React.SetStateAction<boolean>>
}

export { PaymentElement }

export const useCheckoutForm = ({
  customerEmail,
  billingAddress,
  setProcessingPayment,
}: Params) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { clearCart } = useCart()
  const { confirmOrder } = usePayments()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setProcessingPayment(true)

    if (stripe && elements) {
      try {
        const returnUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout/confirm-order${customerEmail ? `?email=${customerEmail}` : ''}`

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
          confirmParams: {
            return_url: returnUrl,
            payment_method_data: {
              billing_details: {
                email: customerEmail,
                phone: billingAddress?.phone,
                address: {
                  line1: billingAddress?.addressLine1,
                  city: billingAddress?.city,
                  postal_code: billingAddress?.postalCode,
                  country: billingAddress?.country,
                },
              },
            },
          },
          elements,
          redirect: 'if_required',
        })

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          try {
            const confirmResult = await confirmOrder('stripe', {
              additionalData: {
                paymentIntentID: paymentIntent.id,
                ...(customerEmail ? { customerEmail } : {}),
              },
            })

            if (
              confirmResult &&
              typeof confirmResult === 'object' &&
              'orderID' in confirmResult &&
              confirmResult.orderID
            ) {
              const redirectUrl = `/orders/${confirmResult.orderID}${customerEmail ? `?email=${customerEmail}` : ''}`
              clearCart()
              router.push(redirectUrl)
            }
          } catch (err) {
            console.log({ err })
            const msg = err instanceof Error ? err.message : 'Something went wrong.'
            setError(`Error while confirming order: ${msg}`)
            setIsLoading(false)
          }
        }
        if (stripeError?.message) {
          setError(stripeError.message)
          setIsLoading(false)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        setError(`Error while submitting payment: ${msg}`)
        setIsLoading(false)
        setProcessingPayment(false)
      }
    }
  }

  return { stripe, error, isLoading, handleSubmit }
}
