import type { FieldHook } from 'payload'

import { encryptToken, isEncrypted } from '../../../token-crypto.util'

/**
 * Encrypts the access token before persisting it.
 * An empty value on update keeps the stored token: the field is never rendered back
 * in the admin form (access.read is false), so saving the form must not wipe it.
 * The previous value is re-encrypted defensively in case it reaches us decrypted
 * (afterRead hooks run on the original doc during updates).
 */
export const encryptAccessToken: FieldHook = ({ value, previousValue }) => {
  const resolved = value === undefined || value === null || value === '' ? previousValue : value

  if (typeof resolved !== 'string' || resolved === '') return resolved

  return isEncrypted(resolved) ? resolved : encryptToken(resolved)
}
