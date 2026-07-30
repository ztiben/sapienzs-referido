import { describe, expect, it } from 'vitest'

import {
  extractAsin,
  mapSourceDeal,
  slugify,
  type SourceDeal,
} from '@/modules/deals/bl/map-source-deal.bl'

const sample: SourceDeal = {
  id: 'amazon_asin_B0DZMJ9L12',
  title: 'WOLF SHIELD Mini WiFi Hidden Camera',
  image_url: 'https://m.media-amazon.com/images/I/41TwmPCRp0L._SL500_.jpg',
  price: 6.39,
  list_price: 7.99,
  discount_percent: 20,
  store_name: 'Amazon',
  ui_category: 'Electronics',
  timestamp: '2026-07-22T11:49:24.021657',
}

describe('map-source-deal bl', () => {
  it('extracts the ASIN from the feed id', () => {
    expect(extractAsin('amazon_asin_B0DZMJ9L12')).toBe('B0DZMJ9L12')
  })

  it('slugifies titles to url-safe, bounded slugs', () => {
    expect(slugify('WOLF SHIELD, Mini WiFi!!')).toBe('wolf-shield-mini-wifi')
    expect(slugify('Café Olé')).toBe('cafe-ole')
    expect(slugify('a'.repeat(80)).length).toBeLessThanOrEqual(60)
  })

  it('maps a source deal to the collection shape', () => {
    const mapped = mapSourceDeal(sample)
    expect(mapped.asin).toBe('B0DZMJ9L12')
    expect(mapped.affiliateUrl).toBe('https://www.amazon.com/dp/B0DZMJ9L12')
    expect(mapped.originalPrice).toBe(7.99)
    expect(mapped.dealPrice).toBe(6.39)
    expect(mapped.categorySlug).toBe('electronics')
    expect(mapped.slug.endsWith('-b0dzmj9l12')).toBe(true)
  })

  it('marks deals with >= 40% discount as featured', () => {
    expect(mapSourceDeal({ ...sample, discount_percent: 20 }).featured).toBe(false)
    expect(mapSourceDeal({ ...sample, discount_percent: 40 }).featured).toBe(true)
    expect(mapSourceDeal({ ...sample, discount_percent: 55 }).featured).toBe(true)
  })
})
