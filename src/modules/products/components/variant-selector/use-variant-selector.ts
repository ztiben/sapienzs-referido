import type { Product } from '@/payload-types'

import { buildVariantOptionState } from '@/modules/products/bl/variant-selector.bl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const useVariantSelector = (product: Product) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const variants = product.variants?.docs
  const variantTypes = product.variantTypes
  const hasVariants = Boolean(
    product.enableVariants && variants?.length && variantTypes?.length,
  )

  const getOptionState = (optionID: number | string, optionKeyLowerCase: string) =>
    buildVariantOptionState({
      optionID,
      optionKeyLowerCase,
      variants,
      searchParamsString: searchParams.toString(),
      pathname,
    })

  const onSelect = (optionUrl: string) => {
    router.replace(`${optionUrl}`, { scroll: false })
  }

  return { hasVariants, variantTypes, getOptionState, onSelect }
}
