import { describe, expect, it } from 'vitest'

import { normalizeSubscriptionEmail } from '@/modules/newsletter/bl/subscription.bl'

describe('normalizeSubscriptionEmail', () => {
  it('trims and lowercases the email', () => {
    expect(normalizeSubscriptionEmail('  Ana.Perez@Gmail.COM ')).toBe('ana.perez@gmail.com')
  })

  it('throws with cause "incomplete" when the email is missing or blank', () => {
    expect(() => normalizeSubscriptionEmail(undefined)).toThrowError(
      expect.objectContaining({ cause: 'incomplete' }),
    )
    expect(() => normalizeSubscriptionEmail('   ')).toThrowError(
      expect.objectContaining({ cause: 'incomplete' }),
    )
  })

  it('throws with cause "invalid" for malformed emails', () => {
    expect(() => normalizeSubscriptionEmail('not-an-email')).toThrowError(
      expect.objectContaining({ cause: 'invalid' }),
    )
    expect(() => normalizeSubscriptionEmail('a@b')).toThrowError(
      expect.objectContaining({ cause: 'invalid' }),
    )
    expect(() => normalizeSubscriptionEmail('a b@c.com')).toThrowError(
      expect.objectContaining({ cause: 'invalid' }),
    )
  })
})
