import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Status = 'confirming' | 'confirmed' | 'pending' | 'error'

export const useConfirmOrder = () => {
  const { confirmOrder } = usePayments()
  const { cart } = useCart()
  const t = useTranslations('confirmOrder')
  const searchParams = useSearchParams()
  const router = useRouter()

  // Ensure we only confirm the order once, even if the component re-renders.
  const isConfirming = useRef(false)
  const [status, setStatus] = useState<Status>('confirming')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!cart || !cart.items || cart.items?.length === 0) {
      return
    }

    const paymentId = searchParams.get('payment_id')

    if (paymentId) {
      if (!isConfirming.current) {
        isConfirming.current = true

        confirmOrder('mercadopago', {
          additionalData: { paymentId, customerEmail: 'placeholder' },
        })
          .then((result) => {
            if (result && typeof result === 'object') {
              if ('status' in result && result.status === 'pending') {
                setStatus('pending')
                return
              }

              if ('orderID' in result && result.orderID) {
                setStatus('confirmed')
                if ('email' in result && result.email) {
                  router.push(`/orders/${result.orderID}?email=${result.email}`)
                }
              }
            }
          })
          .catch((error) => {
            setStatus('error')
            setErrorMessage(error instanceof Error ? error.message : t('unknownError'))
          })
      }
    } else {
      router.push('/')
    }
  }, [cart, searchParams, confirmOrder, router, t])

  return { status, errorMessage }
}
