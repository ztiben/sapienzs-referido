import type { Product, Variant } from '@/payload-types'

import { getDisplayPricing } from '@/modules/products/bl/product-pricing.bl'
import { getPriceField } from '@/shared/bl/currency.bl'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'

export const useProductDescription = (product: Product) => {
  const { currency } = useCurrency()

  return getDisplayPricing(
    product,
    getPriceField<Product>(currency.code),
    getPriceField<Variant>(currency.code),
  )
}
