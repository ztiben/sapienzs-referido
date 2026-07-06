import { describe, it, expect, beforeAll } from 'vitest'

import { encryptToken, decryptToken, isEncrypted } from '@/modules/whatsapp/token-crypto.util'
import { encryptAccessToken } from '@/modules/whatsapp/collections/whatsapp-accounts/hooks/encrypt-access-token'
import { decryptAccessToken } from '@/modules/whatsapp/collections/whatsapp-accounts/hooks/decrypt-access-token'

// Field hooks only read `value` / `previousValue`; a partial arg object is enough
const runHook = (hook: typeof encryptAccessToken, args: Record<string, unknown>) =>
  hook(args as Parameters<typeof encryptAccessToken>[0])

describe('WhatsApp token crypto', () => {
  beforeAll(() => {
    process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'test-payload-secret'
  })

  describe('encryptToken / decryptToken', () => {
    it('round-trips a token', () => {
      const token = 'EAAB-super-secret-token-1234567890'
      const stored = encryptToken(token)

      expect(stored).not.toContain(token)
      expect(stored.startsWith('enc:v1:')).toBe(true)
      expect(decryptToken(stored)).toBe(token)
    })

    it('produces a different ciphertext each time (random IV)', () => {
      const token = 'same-token'
      expect(encryptToken(token)).not.toBe(encryptToken(token))
    })

    it('detects encrypted values', () => {
      expect(isEncrypted(encryptToken('x'))).toBe(true)
      expect(isEncrypted('plaintext')).toBe(false)
    })

    it('passes plaintext through decryptToken unchanged', () => {
      expect(decryptToken('legacy-plaintext-token')).toBe('legacy-plaintext-token')
    })

    it('throws on a tampered ciphertext (GCM auth)', () => {
      const stored = encryptToken('token')
      const tampered = stored.slice(0, -4) + 'AAA='
      expect(() => decryptToken(tampered)).toThrow()
    })
  })

  describe('encryptAccessToken (beforeChange hook)', () => {
    it('encrypts a new plaintext value', () => {
      const result = runHook(encryptAccessToken, { value: 'new-token' }) as string
      expect(isEncrypted(result)).toBe(true)
      expect(decryptToken(result)).toBe('new-token')
    })

    it('does not double-encrypt an already encrypted value', () => {
      const stored = encryptToken('token')
      expect(runHook(encryptAccessToken, { value: stored })).toBe(stored)
    })

    it('keeps the previous (encrypted) token when the update sends an empty value', () => {
      const stored = encryptToken('kept-token')
      expect(runHook(encryptAccessToken, { value: '', previousValue: stored })).toBe(stored)
      expect(runHook(encryptAccessToken, { value: undefined, previousValue: stored })).toBe(stored)
    })

    it('re-encrypts the previous token if it arrives decrypted', () => {
      const result = runHook(encryptAccessToken, {
        value: '',
        previousValue: 'decrypted-token',
      }) as string
      expect(isEncrypted(result)).toBe(true)
      expect(decryptToken(result)).toBe('decrypted-token')
    })
  })

  describe('decryptAccessToken (afterRead hook)', () => {
    it('decrypts a stored token', () => {
      const stored = encryptToken('read-token')
      expect(runHook(decryptAccessToken, { value: stored })).toBe('read-token')
    })

    it('returns corrupted values as-is instead of throwing', () => {
      const corrupted = 'enc:v1:!!!:???:###'
      expect(runHook(decryptAccessToken, { value: corrupted })).toBe(corrupted)
    })
  })
})
