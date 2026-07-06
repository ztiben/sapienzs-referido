export type SupportedCity = {
  label: string
  value: string
  shippingCost?: number
}

export type SupportedCountry = {
  label: string
  value: string
  cities: SupportedCity[]
}
