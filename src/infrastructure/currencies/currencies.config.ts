import type { CurrenciesConfig, Currency } from '@payloadcms/plugin-ecommerce/types'

const COP: Currency = {
  code: 'COP', // The currency code in ISO 4217 format, e.g. 'USD'
  decimals: 0, // The number of decimal places for the currency, e.g. 2 for USD
  label: 'Peso Colombiano', // A human-readable label for the currency, e.g. 'US Dollar'
  symbol: '$', // The currency symbol, e.g. '$'
}

export const currenciesConfig: CurrenciesConfig = {
  defaultCurrency: 'COP',
  supportedCurrencies: [COP], // Añadir cada nueva currency también al record CURRENCY_LOCALES
}

export const CURRENCY_LOCALES: Record<string, string> = {
  COP: 'es-CO',
}
