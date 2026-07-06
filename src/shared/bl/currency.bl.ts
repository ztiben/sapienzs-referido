import { CURRENCY_LOCALES, currenciesConfig } from '@/infrastructure/currencies/currencies.config'

export const formatPrice = (
  amount: number | null | undefined,
  currencyCode: string = currenciesConfig.defaultCurrency,
): string => {
  if (amount === undefined || amount === null) return ''

  const currency = currenciesConfig.supportedCurrencies.find((c) => c.code === currencyCode)
  if (!currency) return amount.toString()

  const value = amount / Math.pow(10, currency.decimals)
  const locale = CURRENCY_LOCALES[currencyCode] ?? 'en-US'

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(value)

  return `${currency.symbol}${formatted}`
}

export const getPriceField = <T>(
  currencyCode: string = currenciesConfig.defaultCurrency,
): keyof T => `priceIn${currencyCode}` as keyof T
