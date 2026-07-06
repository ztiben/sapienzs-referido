import crypto from 'crypto'

/**
 * At-rest encryption for WhatsApp access tokens (AES-256-GCM).
 * The key is derived from PAYLOAD_SECRET (SHA-256) — no extra env var to manage;
 * rotating PAYLOAD_SECRET therefore invalidates stored tokens (they must be re-entered).
 * Stored format: `enc:v1:<iv>:<authTag>:<ciphertext>` (base64 parts) — the prefix
 * prevents double encryption and leaves room for future scheme rotation (v2, ...).
 */

const ENC_PREFIX = 'enc:v1:'

const getKey = (): Buffer => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is required to encrypt/decrypt WhatsApp tokens')
  return crypto.createHash('sha256').update(secret).digest()
}

export const isEncrypted = (value: string): boolean => value.startsWith(ENC_PREFIX)

export const encryptToken = (plaintext: string): string => {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${ENC_PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`
}

export const decryptToken = (stored: string): string => {
  if (!isEncrypted(stored)) return stored // plaintext passthrough (value not yet encrypted)

  const [ivB64, authTagB64, dataB64] = stored.slice(ENC_PREFIX.length).split(':')
  if (!ivB64 || !authTagB64 || !dataB64) throw new Error('Malformed encrypted token')

  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'))

  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}
