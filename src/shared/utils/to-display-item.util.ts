import type { Deal, Media, Retailer } from '@/payload-types'
import type { SupportedCurrency } from '@/shared/bl/format-price.bl'

export type DisplayItem = {
  title: string
  slug: string
  collection: 'deals'
  image?: Media | number | null
  price?: number
  originalPrice?: number
  currency?: SupportedCurrency
  retailerName?: string
  expiresAt?: string | null
}

export function toDisplayItem(doc: Deal): DisplayItem {
  const retailer = doc.retailer

  return {
    title: doc.title,
    slug: doc.slug,
    collection: 'deals',
    image: doc.image ?? null,
    price: doc.dealPrice,
    originalPrice: doc.originalPrice,
    currency: (doc.currency as SupportedCurrency | null | undefined) ?? undefined,
    retailerName:
      retailer && typeof retailer === 'object' ? (retailer as Retailer).name : undefined,
    expiresAt: doc.expiresAt ?? null,
  }
}
