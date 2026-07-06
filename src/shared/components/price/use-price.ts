import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'

export const usePrice = (currencyCodeFromProps?: string) => {
  const { supportedCurrencies } = useCurrency()

  const currencyCode = currencyCodeFromProps
    ? supportedCurrencies.find((c) => c.code === currencyCodeFromProps)?.code
    : undefined

  return { currencyCode }
}
