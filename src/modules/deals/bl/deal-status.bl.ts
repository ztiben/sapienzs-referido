/**
 * Pure deal scheduling rules. Dates are ISO strings as stored by Payload.
 */

export const isDealExpired = (now: Date, expiresAt?: string | null): boolean => {
  if (!expiresAt) return false

  return new Date(expiresAt).getTime() <= now.getTime()
}

export const isDealStarted = (now: Date, startsAt?: string | null): boolean => {
  if (!startsAt) return true

  return new Date(startsAt).getTime() <= now.getTime()
}

export const isDealActive = (
  now: Date,
  startsAt?: string | null,
  expiresAt?: string | null,
): boolean => {
  return isDealStarted(now, startsAt) && !isDealExpired(now, expiresAt)
}

/**
 * Validates that the deal window is coherent: `expiresAt` must be after
 * `startsAt` when both are present.
 *
 * Throws `Error` with `cause: 'invalid'` when the window is inverted.
 */
export const checkDealSchedule = (startsAt?: string | null, expiresAt?: string | null): void => {
  if (!startsAt || !expiresAt) return

  if (new Date(expiresAt).getTime() <= new Date(startsAt).getTime()) {
    throw new Error(undefined, { cause: 'invalid' })
  }
}
