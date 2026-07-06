import type { City, Country } from '@/payload-types'
import { getPriceField } from '@/shared/bl/currency.bl'
import type { SupportedCountry } from '@/shared/models/supported-country.model'

export function mapSupportedCountries(countries: Country[]): SupportedCountry[] {
  if (!countries.length) return []

  const priceField = getPriceField<City>()
  return countries.map((country) => {
    const cityDocs = country.cities?.docs?.filter((c): c is City => typeof c === 'object') ?? []
    return {
      label: country.name,
      value: country.name,
      cities: cityDocs.map((city) => ({
        label: city.name,
        value: city.name,
        shippingCost: (city[priceField] as number | null) ?? undefined,
      })),
    }
  })
}
