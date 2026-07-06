import { describe, expect, it } from 'vitest'

import { computeDiscountPercent } from '@/shared/bl/discount.bl'

describe('computeDiscountPercent', () => {
  it('computes the rounded discount percentage', () => {
    expect(computeDiscountPercent(100, 75)).toBe(25)
    expect(computeDiscountPercent(89900, 59900)).toBe(33)
    expect(computeDiscountPercent(3, 2)).toBe(33)
  })

  it('throws with cause "incomplete" when a price is missing', () => {
    expect(() => computeDiscountPercent(undefined, 50)).toThrowError(
      expect.objectContaining({ cause: 'incomplete' }),
    )
    expect(() => computeDiscountPercent(100, null)).toThrowError(
      expect.objectContaining({ cause: 'incomplete' }),
    )
  })

  it('throws with cause "invalid" when the deal price is not lower', () => {
    expect(() => computeDiscountPercent(100, 100)).toThrowError(
      expect.objectContaining({ cause: 'invalid' }),
    )
    expect(() => computeDiscountPercent(100, 150)).toThrowError(
      expect.objectContaining({ cause: 'invalid' }),
    )
  })

  it('throws with cause "invalid" for non-positive original prices', () => {
    expect(() => computeDiscountPercent(0, 0)).toThrowError(
      expect.objectContaining({ cause: 'invalid' }),
    )
    expect(() => computeDiscountPercent(-10, -20)).toThrowError(
      expect.objectContaining({ cause: 'invalid' }),
    )
  })
})
