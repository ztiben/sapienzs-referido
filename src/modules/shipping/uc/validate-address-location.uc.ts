import { checkAddressLocationSupported } from '@/modules/shipping/bl/address-location-supported.bl'
import type { CollectionBeforeValidateHook } from 'payload'
import { APIError } from 'payload'

/**
 * Orchestrates the address-location rule: fetches the configured countries/
 * cities via the Local API, delegates the decision to the pure bl, and maps a
 * thrown `cause` to an APIError. Messages are plain (not `req.t`-translated)
 * because an APIError surfaces in the network response, not the admin UI.
 */
export const validateAddressLocationBeforeValidate: CollectionBeforeValidateHook = async ({
  data,
  req,
}) => {
  if (!data?.country || !data?.city) return data

  const totalCountries = await req.payload.count({ collection: 'countries', req })

  const countriesResult = await req.payload.find({
    collection: 'countries',
    where: { name: { equals: data.country } },
    limit: 1,
    req,
  })

  const country = countriesResult.docs[0]

  const citiesResult = country
    ? await req.payload.find({
        collection: 'cities',
        where: {
          and: [{ name: { equals: data.city } }, { country: { equals: country.id } }],
        },
        limit: 1,
        req,
      })
    : null

  try {
    checkAddressLocationSupported({
      totalCountries: totalCountries.totalDocs,
      countryExists: countriesResult.totalDocs > 0,
      cityExistsForCountry: (citiesResult?.totalDocs ?? 0) > 0,
    })
  } catch (error) {
    let message = 'Invalid address location.'

    if (error instanceof Error) {
      if (error.cause === 'incomplete') {
        message = 'No supported countries configured. Please configure shipping settings.'
      } else if (error.cause === 'invalid') {
        message = `Country "${data.country}" / city "${data.city}" is not supported.`
      }
    }

    throw new APIError(message, 400)
  }

  return data
}
