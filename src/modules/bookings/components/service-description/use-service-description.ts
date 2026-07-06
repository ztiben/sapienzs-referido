import type { Service } from '@/payload-types'

import { getPriceField } from '@/shared/bl/currency.bl'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'

export const useServiceDescription = (service: Service) => {
  const { currency } = useCurrency()
  const priceField = getPriceField<Service>(currency.code)
  const amount = service[priceField] as null | number | undefined

  return { amount }
}
