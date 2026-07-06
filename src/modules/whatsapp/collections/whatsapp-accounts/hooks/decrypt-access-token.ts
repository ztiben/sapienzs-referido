import type { FieldHook } from 'payload'

import { decryptToken } from '../../../token-crypto.util'

/**
 * Decrypts the access token on read. Only internal reads see the result:
 * the field's access.read is false, so the API strips it for every request —
 * the plaintext token is only reachable via the Local API with overrideAccess: true.
 * Corrupted values are logged and returned as-is instead of breaking every read.
 */
export const decryptAccessToken: FieldHook = ({ value }) => {
  if (typeof value !== 'string' || value === '') return value

  try {
    return decryptToken(value)
  } catch (error) {
    console.error('[WhatsApp] Failed to decrypt access token:', error)
    return value
  }
}
