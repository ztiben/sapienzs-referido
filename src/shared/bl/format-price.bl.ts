export type SupportedCurrency = 'COP' | 'USD'

const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  COP: 'es-CO',
  USD: 'en-US',
}

const CURRENCY_DECIMALS: Record<SupportedCurrency, number> = {
  COP: 0,
  USD: 2,
}

export const DEFAULT_CURRENCY: SupportedCurrency = 'COP'

/**
 * Formats an amount expressed in major currency units (e.g. 89900 COP, 24.99 USD).
 */
export const formatPrice = (
  amount: number | null | undefined,
  currencyCode: SupportedCurrency = DEFAULT_CURRENCY,
): string => {
  if (amount === undefined || amount === null) return ''

  const locale = CURRENCY_LOCALES[currencyCode]
  const decimals = CURRENCY_DECIMALS[currencyCode]

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}
