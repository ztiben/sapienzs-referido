import { mapSupportedCountries } from '@/shared/bl/map-supported-countries.bl'
import type { SupportedCountry } from '@/shared/models/supported-country.model'
import type { Country } from '@/payload-types'
import useSWR from 'swr'

export const useSupportedCountries = (): {
  countries: SupportedCountry[]
  isLoading: boolean
} => {
  const { data, isLoading } = useSWR<{ docs: Country[] }>(
    '/api/countries?depth=1&limit=100',
  )

  return {
    countries: data ? mapSupportedCountries(data.docs) : [],
    isLoading,
  }
}
