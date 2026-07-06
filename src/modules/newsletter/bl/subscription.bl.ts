const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Normalizes and validates a subscription email.
 *
 * Throws `Error` with `cause: 'incomplete'` when the email is missing and
 * `cause: 'invalid'` when it does not look like an email address.
 */
export const normalizeSubscriptionEmail = (email: string | null | undefined): string => {
  if (!email || !email.trim()) {
    throw new Error(undefined, { cause: 'incomplete' })
  }

  const normalized = email.trim().toLowerCase()

  if (!EMAIL_PATTERN.test(normalized)) {
    throw new Error(undefined, { cause: 'invalid' })
  }

  return normalized
}
