'use client'

import { AddressItem } from '@/shared/components/address-item/address-item.component.client'
import { CheckoutAddresses } from '@/shared/components/checkout-addresses/checkout-addresses.component.client'
import { CreateAddressModal } from '@/shared/components/create-address-modal/create-address-modal.component.client'
import { FormItem } from '@/shared/components/form-item/form-item.component'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

import { CartSummary } from './cart-summary/cart-summary.component'
import { useCheckoutPage } from './use-checkout-page'

type Props = {
  mercadoPagoEnabled: boolean
  whatsAppEnabled: boolean
  whatsAppNumber?: string
}

export const CheckoutPage: React.FC<Props> = (props) => {
  const t = useTranslations('checkout')
  const {
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
  } = useCheckoutPage(props)

  if (cartIsEmpty) {
    return (
      <div className="prose py-12 w-full items-center">
        <p>{t('cartEmpty')}</p>
        <Link href="/shop">{t('continueShopping')}</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        <h2 className="font-medium text-3xl">{t('contact')}</h2>
        {!user && (
          <div className="bg-base-200 rounded-lg p-4 w-full flex items-center">
            <div className="prose">
              <Button asChild className="no-underline">
                <Link href="/login">{t('logIn')}</Link>
              </Button>
              <p className="mt-0">
                <span className="mx-2">{t('or')}</span>
                <Link href="/create-account">{t('createAccount')}</Link>
              </p>
            </div>
          </div>
        )}
        {user ? (
          <div className="bg-base-200 rounded-lg p-4">
            <div>
              <p>{user.email}</p>{' '}
              <p>
                {t('notYou')}{' '}
                <Link className="underline" href="/logout">
                  {t('logOut')}
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-base-200 rounded-lg p-4">
            <div>
              <p className="mb-4">{t('guestEmail')}</p>

              <FormItem className="mb-6">
                <Label htmlFor="email">{t('emailAddress')}</Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </FormItem>

              <Button
                disabled={!email || !emailEditable}
                onClick={(e) => {
                  e.preventDefault()
                  setEmailEditable(false)
                }}
                variant="outline"
              >
                {t('continueAsGuest')}
              </Button>
            </div>
          </div>
        )}

        <h2 className="font-medium text-3xl">{t('address')}</h2>

        {billingAddress ? (
          <div>
            <AddressItem
              actions={
                <Button
                  variant={'outline'}
                  onClick={(e) => {
                    e.preventDefault()
                    setBillingAddress(undefined)
                  }}
                >
                  {t('remove')}
                </Button>
              }
              address={billingAddress}
            />
          </div>
        ) : user ? (
          <CheckoutAddresses heading={t('billingAddress')} setAddress={setBillingAddress} />
        ) : (
          <CreateAddressModal
            disabled={!email || Boolean(emailEditable)}
            callback={(address) => {
              setBillingAddress(address)
            }}
            skipSubmission={true}
          />
        )}

        <div className="flex gap-4 items-center">
          <Checkbox
            id="shippingTheSameAsBilling"
            checked={billingAddressSameAsShipping}
            disabled={Boolean(!user && (!email || Boolean(emailEditable)))}
            onCheckedChange={(state) => {
              setBillingAddressSameAsShipping(state as boolean)
            }}
          />
          <Label htmlFor="shippingTheSameAsBilling">{t('shippingSameAsBilling')}</Label>
        </div>

        {!billingAddressSameAsShipping && (
          <>
            {shippingAddress ? (
              <div>
                <AddressItem
                  actions={
                    <Button
                      variant={'outline'}
                      onClick={(e) => {
                        e.preventDefault()
                        setShippingAddress(undefined)
                      }}
                    >
                      {t('remove')}
                    </Button>
                  }
                  address={shippingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses
                heading={t('shippingAddress')}
                description={t('shippingDescription')}
                setAddress={setShippingAddress}
              />
            ) : (
              <CreateAddressModal
                callback={(address) => {
                  setShippingAddress(address)
                }}
                disabled={!email || Boolean(emailEditable)}
                skipSubmission={true}
              />
            )}
          </>
        )}

        <h2 className="font-medium text-3xl">{t('choosePaymentMethod')}</h2>

        <div>
          {enabledMethods.length === 1 ? (
            <p>{t(enabledMethods[0] === 'mercadopago' ? 'mercadoPago' : 'whatsApp')}</p>
          ) : (
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
              className="gap-4"
            >
              {enabledMethods.map((m) => (
                <div key={m} className="flex gap-4 items-center">
                  <RadioGroupItem id={`pm-${m}`} value={m} />
                  <Label htmlFor={`pm-${m}`}>
                    {t(m === 'mercadopago' ? 'mercadoPago' : 'whatsApp')}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </div>

      {!cartIsEmpty && (
        <CartSummary
          cart={cart}
          priceField={priceField}
          variantPriceField={variantPriceField}
          shippingCost={shippingCost}
          canPay={canPay}
          error={error}
          onFinalize={handleFinalize}
          onClearError={() => setError(null)}
        />
      )}
    </div>
  )
}
