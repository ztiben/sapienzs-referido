import crypto from 'crypto'

/**
 * Verifies Meta's webhook signature: `X-Hub-Signature-256: sha256=<hex>`
 * where <hex> is the HMAC-SHA256 of the RAW request body keyed with the App Secret.
 * Uses a timing-safe comparison to prevent signature-guessing via timing attacks.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
 */
export const verifyWebhookSignature = (
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
): boolean => {
  if (!signatureHeader?.startsWith('sha256=')) return false

  const expected = crypto.createHmac('sha256', appSecret).update(rawBody, 'utf8').digest()
  const received = Buffer.from(signatureHeader.slice('sha256='.length), 'hex')

  // Buffer.from(...) silently truncates invalid hex, so a length check also rejects malformed input
  if (received.length !== expected.length) return false

  return crypto.timingSafeEqual(expected, received)
}
