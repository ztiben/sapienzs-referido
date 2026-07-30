/**
 * Pure mapping from an external deals-feed item to the normalized shape our
 * `deals` collection expects. No side effects, no Payload, no fetch — just data.
 * Consumed by the import use case (`import-deals.uc.ts`) and the CLI script.
 */

export type SourceDeal = {
  id: string
  title: string
  image_url: string
  price: number
  list_price: number
  discount_percent: number
  store_name: string
  ui_category: string
  timestamp: string
}

export type MappedDeal = {
  asin: string
  title: string
  imageUrl: string
  originalPrice: number
  dealPrice: number
  affiliateUrl: string
  categoryTitle: string
  categorySlug: string
  featured: boolean
  slug: string
  lastSyncedAt: string
}

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')

// "amazon_asin_B0DZMJ9L12" -> "B0DZMJ9L12"
export const extractAsin = (id: string): string => id.replace(/^amazon_asin_/, '')

export const guessImageMime = (url: string): string => {
  const clean = url.split('?')[0].toLowerCase()
  if (clean.endsWith('.png')) return 'image/png'
  if (clean.endsWith('.webp')) return 'image/webp'
  if (clean.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

/** Deals with a discount of at least this percent are surfaced on the home page. */
const FEATURED_MIN_DISCOUNT = 40

export const mapSourceDeal = (deal: SourceDeal): MappedDeal => {
  const asin = extractAsin(deal.id)

  return {
    asin,
    title: deal.title,
    imageUrl: deal.image_url,
    originalPrice: deal.list_price,
    dealPrice: deal.price,
    affiliateUrl: `https://www.amazon.com/dp/${asin}`,
    categoryTitle: deal.ui_category,
    categorySlug: slugify(deal.ui_category),
    featured: deal.discount_percent >= FEATURED_MIN_DISCOUNT,
    slug: `${slugify(deal.title)}-${asin.toLowerCase()}`,
    lastSyncedAt: deal.timestamp,
  }
}
