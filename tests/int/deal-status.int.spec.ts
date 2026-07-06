import { describe, expect, it } from 'vitest'

import {
  checkDealSchedule,
  isDealActive,
  isDealExpired,
  isDealStarted,
} from '@/modules/deals/bl/deal-status.bl'

const NOW = new Date('2026-07-05T12:00:00.000Z')

describe('isDealExpired', () => {
  it('is not expired without an expiration date', () => {
    expect(isDealExpired(NOW, null)).toBe(false)
    expect(isDealExpired(NOW, undefined)).toBe(false)
  })

  it('is expired when the expiration date has passed', () => {
    expect(isDealExpired(NOW, '2026-07-05T11:59:59.000Z')).toBe(true)
    expect(isDealExpired(NOW, '2026-07-06T00:00:00.000Z')).toBe(false)
  })
})

describe('isDealStarted', () => {
  it('is started without a start date', () => {
    expect(isDealStarted(NOW, null)).toBe(true)
  })

  it('respects the start date', () => {
    expect(isDealStarted(NOW, '2026-07-05T12:00:00.000Z')).toBe(true)
    expect(isDealStarted(NOW, '2026-07-05T12:00:01.000Z')).toBe(false)
  })
})

describe('isDealActive', () => {
  it('is active inside the window', () => {
    expect(isDealActive(NOW, '2026-07-01T00:00:00.000Z', '2026-07-31T00:00:00.000Z')).toBe(true)
  })

  it('is inactive before the start or after the expiration', () => {
    expect(isDealActive(NOW, '2026-08-01T00:00:00.000Z', null)).toBe(false)
    expect(isDealActive(NOW, null, '2026-07-01T00:00:00.000Z')).toBe(false)
  })
})

describe('checkDealSchedule', () => {
  it('accepts a coherent window and missing bounds', () => {
    expect(() =>
      checkDealSchedule('2026-07-01T00:00:00.000Z', '2026-07-31T00:00:00.000Z'),
    ).not.toThrow()
    expect(() => checkDealSchedule(null, '2026-07-31T00:00:00.000Z')).not.toThrow()
    expect(() => checkDealSchedule('2026-07-01T00:00:00.000Z', null)).not.toThrow()
  })

  it('throws with cause "invalid" for an inverted window', () => {
    expect(() =>
      checkDealSchedule('2026-07-31T00:00:00.000Z', '2026-07-01T00:00:00.000Z'),
    ).toThrowError(expect.objectContaining({ cause: 'invalid' }))
  })
})
