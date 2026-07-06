'use client'
import type { Address, Config } from '@/payload-types'

import { FormError } from '@/shared/components/form-error/form-error.component'
import { FormItem } from '@/shared/components/form-item/form-item.component'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useTranslations } from 'next-intl'
import React from 'react'

import { useAddressForm } from './use-address-form'

type Props = {
  addressID?: Config['db']['defaultIDType']
  initialData?: Partial<Omit<Address, 'country' | 'createdAt' | 'id' | 'updatedAt'>> & {
    country?: string
  }
  callback?: (data: Partial<Address>) => void
  /**
   * If true, the form will not submit to the API.
   */
  skipSubmission?: boolean
}

export const AddressForm: React.FC<Props> = (props) => {
  const { initialData } = props
  const t = useTranslations('address')
  const {
    onSubmit,
    register,
    errors,
    supportedCountries,
    availableCities,
    selectedCountry,
    onCountryChange,
    onCityChange,
  } = useAddressForm(props)

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-4 mb-8">
        <FormItem>
          <Label htmlFor="name">{t('nameLabel')}</Label>
          <Input
            id="name"
            autoComplete="name"
            {...register('name', { required: t('nameRequired') })}
          />
          {errors.name && <FormError message={errors.name.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="company">{t('companyLabel')}</Label>
          <Input id="company" autoComplete="organization" {...register('company')} />
          {errors.company && <FormError message={errors.company.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="phone">{t('phoneLabel')}</Label>
          <Input type="tel" id="phone" autoComplete="tel" {...register('phone')} />
          {errors.phone && <FormError message={errors.phone.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="addressLine1">{t('addressLabel')}</Label>
          <Input
            id="addressLine1"
            autoComplete="address-line1"
            {...register('addressLine1', { required: t('addressRequired') })}
          />
          {errors.addressLine1 && <FormError message={errors.addressLine1.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="country">{t('countryLabel')}</Label>

          <Select
            {...register('country', {
              required: t('countryRequired'),
            })}
            onValueChange={onCountryChange}
            required
            defaultValue={initialData?.country || ''}
          >
            <SelectTrigger id="country" className="w-full">
              <SelectValue placeholder={t('countryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {supportedCountries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && <FormError message={errors.country.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="city">{t('cityLabel')}</Label>

          <Select
            {...register('city', {
              required: t('cityRequired'),
            })}
            onValueChange={onCityChange}
            required
            defaultValue={initialData?.city || ''}
            disabled={!selectedCountry || availableCities.length === 0}
          >
            <SelectTrigger id="city" className="w-full">
              <SelectValue
                placeholder={selectedCountry ? t('selectCity') : t('selectCountryFirst')}
              />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <FormError message={errors.city.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="postalCode">{t('postalCodeLabel')}</Label>
          <Input id="postalCode" autoComplete="postal-code" {...register('postalCode')} />
          {errors.postalCode && <FormError message={errors.postalCode.message} />}
        </FormItem>
      </div>

      <Button type="submit">{t('submit')}</Button>
    </form>
  )
}
