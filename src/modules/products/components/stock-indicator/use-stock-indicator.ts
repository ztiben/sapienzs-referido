import type { Product } from '@/payload-types'

import { getStockInfo, resolveSelectedVariant } from '@/modules/products/bl/product-variant.bl'
import { useSearchParams } from 'next/navigation'

export const useStockIndicator = (product: Product) => {
  const searchParams = useSearchParams()
  const selectedVariant = resolveSelectedVariant(product, searchParams.get('variant'))
  return getStockInfo(product, selectedVariant)
}
