import type { Address, Config } from '@/payload-types'

import { useSupportedCountries } from '@/shared/hooks/use-supported-countries'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { deepMergeSimple } from 'payload/shared'
import { useForm } from 'react-hook-form'

export type AddressFormValues = {
  name?: null | string
  company?: null | string
  phone?: null | string
  addressLine1?: null | string
  city?: null | string
  postalCode?: null | string
  country?: null | string
}

type Params = {
  addressID?: Config['db']['defaultIDType']
  initialData?: Partial<Omit<Address, 'country' | 'createdAt' | 'id' | 'updatedAt'>> & {
    country?: string
  }
  callback?: (data: Partial<Address>) => void
  skipSubmission?: boolean
}

export const useAddressForm = ({ addressID, initialData, callback, skipSubmission }: Params) => {
  const { countries: supportedCountries } = useSupportedCountries()
  const { createAddress, updateAddress } = useAddresses()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormValues>({
    defaultValues: initialData,
  })

  const selectedCountry = watch('country')
  const availableCities =
    (selectedCountry && supportedCountries.find((c) => c.value === selectedCountry)?.cities) || []

  const onCountryChange = (value: string) => {
    setValue('country', value, { shouldValidate: true })
    setValue('city', null)
  }

  const onCityChange = (value: string) => {
    setValue('city', value, { shouldValidate: true })
  }

  const onSubmit = handleSubmit(async (data) => {
    const newData = deepMergeSimple(initialData || {}, data)

    if (!skipSubmission) {
      if (addressID) {
        await updateAddress(addressID, newData)
      } else {
        await createAddress(newData)
      }
    }

    callback?.(newData)
  })

  return {
    onSubmit,
    register,
    errors,
    supportedCountries,
    availableCities,
    selectedCountry,
    onCountryChange,
    onCityChange,
  }
}
