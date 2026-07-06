import type { Product } from '@/payload-types'

import { createUrl } from '@/shared/utils/create-url.util'

export type VariantOptionState = {
  optionUrl: string
  isAvailableForSale: boolean
  isActive: boolean
}

/**
 * Pure: given the current URL state and a product's variants, computes the
 * URL, availability and active state for one selectable variant option.
 */
export const buildVariantOptionState = ({
  optionID,
  optionKeyLowerCase,
  variants,
  searchParamsString,
  pathname,
}: {
  optionID: number | string
  optionKeyLowerCase: string
  variants: NonNullable<Product['variants']>['docs'] | undefined
  searchParamsString: string
  pathname: string
}): VariantOptionState => {
  const searchParams = new URLSearchParams(searchParamsString)
  const optionSearchParams = new URLSearchParams(searchParamsString)

  optionSearchParams.delete('variant')
  optionSearchParams.delete('image')
  optionSearchParams.set(optionKeyLowerCase, String(optionID))

  let isAvailableForSale = false

  if (variants) {
    const otherSelectedOptions = Array.from(searchParams.entries()).filter(
      ([key]) => key !== optionKeyLowerCase && key !== 'variant' && key !== 'image',
    )

    const matchingVariant = variants
      .filter((variant) => typeof variant === 'object')
      .find((variant) => {
        if (!variant.options || !Array.isArray(variant.options)) return false

        const hasCurrentOption = variant.options.some((variantOption) => {
          if (typeof variantOption !== 'object') return String(variantOption) === String(optionID)
          return variantOption.id === optionID
        })
        if (!hasCurrentOption) return false

        return otherSelectedOptions.every(([, value]) =>
          variant.options!.some((variantOption) => {
            if (typeof variantOption !== 'object') return String(variantOption) === value
            return String(variantOption.id) === value
          }),
        )
      })

    if (matchingVariant) {
      optionSearchParams.set('variant', String(matchingVariant.id))
      if (matchingVariant.infiniteInventory) {
        isAvailableForSale = true
      } else if (matchingVariant.inventory && matchingVariant.inventory > 0) {
        isAvailableForSale = true
      }
    }
  }

  const optionUrl = createUrl(pathname, optionSearchParams)
  const isActive =
    Boolean(isAvailableForSale) && searchParams.get(optionKeyLowerCase) === String(optionID)

  return { optionUrl, isAvailableForSale, isActive }
}
