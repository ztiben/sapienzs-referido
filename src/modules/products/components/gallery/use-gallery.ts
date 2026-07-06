import type { Product } from '@/payload-types'

import { type CarouselApi } from '@/shared/components/ui/carousel'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { DefaultDocumentIDType } from 'payload'

export const useGallery = (gallery: NonNullable<Product['gallery']>) => {
  const searchParams = useSearchParams()
  const [current, setCurrent] = useState(0)
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    const values = Array.from(searchParams.values())

    if (values && api) {
      const index = gallery.findIndex((item) => {
        if (!item.variantOption) return false

        let variantID: DefaultDocumentIDType
        if (typeof item.variantOption === 'object') {
          variantID = item.variantOption.id
        } else variantID = item.variantOption

        return Boolean(values.find((value) => value === String(variantID)))
      })
      if (index !== -1) {
        setCurrent(index)
        api.scrollTo(index, true)
      }
    }
  }, [searchParams, api, gallery])

  return { current, setCurrent, setApi }
}
