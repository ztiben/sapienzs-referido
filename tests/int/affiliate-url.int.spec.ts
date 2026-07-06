import { describe, expect, it } from 'vitest'

import { buildAffiliateUrl } from '@/modules/deals/bl/affiliate-url.bl'

describe('buildAffiliateUrl', () => {
  it('substitutes {url} in the retailer template', () => {
    expect(buildAffiliateUrl('https://www.amazon.com/dp/B0TEST', '{url}?tag=sapyenzs-20')).toBe(
      'https://www.amazon.com/dp/B0TEST?tag=sapyenzs-20',
    )
  })

  it('works with raw URLs that already carry a query string', () => {
    expect(
      buildAffiliateUrl('https://www.exito.com/p/123?color=rojo', '{url}&ref=sapyenzs'),
    ).toBe('https://www.exito.com/p/123?color=rojo&ref=sapyenzs')
  })

  it('returns the raw URL when the template is missing or has no placeholder', () => {
    expect(buildAffiliateUrl('https://example.com/p/1', null)).toBe('https://example.com/p/1')
    expect(buildAffiliateUrl('https://example.com/p/1', '')).toBe('https://example.com/p/1')
    expect(buildAffiliateUrl('https://example.com/p/1', 'no-placeholder')).toBe(
      'https://example.com/p/1',
    )
  })

  it('throws with cause "incomplete" when the raw URL is missing', () => {
    expect(() => buildAffiliateUrl(null, '{url}')).toThrowError(
      expect.objectContaining({ cause: 'incomplete' }),
    )
    expect(() => buildAffiliateUrl('', '{url}')).toThrowError(
      expect.objectContaining({ cause: 'incomplete' }),
    )
  })
})
