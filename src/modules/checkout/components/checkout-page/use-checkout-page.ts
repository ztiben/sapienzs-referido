import type { Address, Product, Variant } from '@/payload-types'

import {
  buildWhatsAppHref,
  canGoToPayment,
  getEnabledMethods,
  getShippingCost,
  isCartEmpty,
  type CartItem,
  type PaymentMethod,
} from '@/modules/checkout/bl/checkout.bl'
import { getPriceField } from '@/shared/bl/currency.bl'
import { useSupportedCountries } from '@/shared/hooks/use-supported-countries'
import { useAuth } from '@/shared/providers/auth.provider.client'
import {
  useAddresses,
  useCart,
  useCurrency,
  usePayments,
} from '@payloadcms/plugin-ecommerce/client/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Props = {
  mercadoPagoEnabled: boolean
  whatsAppEnabled: boolean
  whatsAppNumber?: string
}

export const useCheckoutPage = ({ mercadoPagoEnabled, whatsAppEnabled, whatsAppNumber }: Props) => {
  const t = useTranslations('checkout')
  const { user } = useAuth()
  const { cart } = useCart()
  const { currency } = useCurrency()
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const { countries } = useSupportedCountries()

  const priceField = getPriceField<Product>(currency.code)
  const variantPriceField = getPriceField<Variant>(currency.code)

  const enabledMethods = getEnabledMethods({
    mercadoPagoEnabled,
    whatsAppEnabled,
    whatsAppNumber,
  })

  const [error, setError] = useState<null | string>(null)
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(
    enabledMethods.length === 1 ? enabledMethods[0] : undefined,
  )

  const effectiveShippingAddress = billingAddressSameAsShipping ? billingAddress : shippingAddress
  const shippingCost = getShippingCost(countries, effectiveShippingAddress)
  const cartIsEmpty = isCartEmpty(cart)

  const canPay = canGoToPayment({
    hasEmailOrUser: Boolean(email || user),
    billingAddress,
    billingAddressSameAsShipping,
    shippingAddress,
    paymentMethod,
  })

  const waHref = buildWhatsAppHref({
    whatsAppNumber,
    customerEmail: user?.email || email,
    items: (cart?.items ?? []) as CartItem[],
    billingAddress,
    shippingAddress: effectiveShippingAddress,
    billingAddressSameAsShipping,
    labels: {
      hello: t('whatsappHello'),
      cartId: t('whatsappCartId', { id: cart?.id ?? '' }),
      customer: t('whatsappCustomer'),
      email: t('whatsappEmail'),
      addressBoth: t('whatsappAddressBoth'),
      billingAddress: t('whatsappBillingAddress'),
      shippingAddress: t('whatsappShippingAddress'),
    },
  })

  // Prefill a default billing address once addresses load.
  useEffect(() => {
    if (!user) {
      setBillingAddress(undefined)
      return
    }
    if (!shippingAddress && addresses && addresses.length > 0) {
      const defaultAddress = addresses[0]
      if (defaultAddress) setBillingAddress(defaultAddress)
    }
  }, [addresses, shippingAddress, user])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = async () => {
    try {
      const paymentData = (await initiatePayment('mercadopago', {
        additionalData: {
          customerEmail: email,
          billingAddress,
          shippingAddress: effectiveShippingAddress,
          cart,
        },
      })) as Record<string, unknown>

      const initPoint = (paymentData?.init_point ?? paymentData?.sandbox_init_point) as
        | string
        | undefined
      if (initPoint) {
        window.location.href = initPoint
      } else {
        throw new Error()
      }
    } catch {
      const errorMessage = t('paymentError')
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleFinalize = (e: React.MouseEvent) => {
    e.preventDefault()
    if (paymentMethod === 'mercadopago') {
      void initiatePaymentIntent()
    } else if (paymentMethod === 'whatsapp') {
      window.open(waHref, '_blank', 'noopener,noreferrer')
    }
  }

  return {
    user,
    cart,
    cartIsEmpty,
    priceField,
    variantPriceField,
    enabledMethods,
    email,
    setEmail,
    emailEditable,
    setEmailEditable,
    shippingAddress,
    setShippingAddress,
    billingAddress,
    setBillingAddress,
    billingAddressSameAsShipping,
    setBillingAddressSameAsShipping,
    paymentMethod,
    setPaymentMethod,
    shippingCost,
    canPay,
    error,
    setError,
    handleFinalize,
  }
}
