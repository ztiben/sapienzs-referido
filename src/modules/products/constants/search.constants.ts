import { features } from '@/infrastructure/features'
import { currenciesConfig } from '@/infrastructure/currencies/currencies.config'
import { SortFilterItem } from '../models/search.model'

export const SHOP_TYPES = [
  ...(features.products ? [{ id: 'products', title: 'typeProducts' }] : []),
  ...(features.services ? [{ id: 'services', title: 'typeServices' }] : []),
]

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,
  title: 'sortAlphabetical',
}

const priceField = `priceIn${currenciesConfig.defaultCurrency}`

export const sorting: SortFilterItem[] = [
  defaultSort,
  { slug: '-createdAt', reverse: true, title: 'sortLatest' },
  { slug: priceField, reverse: false, title: 'sortPriceLow' }, // asc
  { slug: `-${priceField}`, reverse: true, title: 'sortPriceHigh' },
]
