type Params = {
  totalCountries: number
  countryExists: boolean
  cityExistsForCountry: boolean
}

/**
 * Pure rule: an address may only use a country/city pair that exists in the
 * configured shipping catalogue. Signals failures by throwing `Error` with the
 * shared `cause` discriminator (`'incomplete'` | `'invalid'`); the `uc/` maps
 * the cause to a message. No Payload, no side effects.
 */
export const checkAddressLocationSupported = ({
  totalCountries,
  countryExists,
  cityExistsForCountry,
}: Params): void => {
  if (totalCountries === 0) throw new Error(undefined, { cause: 'incomplete' })
  if (!countryExists) throw new Error(undefined, { cause: 'invalid' })
  if (!cityExistsForCountry) throw new Error(undefined, { cause: 'invalid' })
}
