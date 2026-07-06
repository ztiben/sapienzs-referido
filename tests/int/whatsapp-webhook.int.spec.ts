import crypto from 'crypto'
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'

vi.mock('@/modules/whatsapp/whatsapp.client', () => ({
  sendTextMessage: vi.fn().mockResolvedValue('wamid.outbound-test'),
}))

// The route builds the Local API instance; tests inject a lightweight mock instead
// of loading the full Payload config (which would require a live database).
const mockPayload = {
  find: vi.fn(),
  create: vi.fn(),
}
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('payload')>()),
  getPayload: vi.fn(async () => mockPayload),
}))

import { sendTextMessage } from '@/modules/whatsapp/whatsapp.client'
import { verifyWebhookSignature } from '@/modules/whatsapp/webhook-signature.util'
import { isStale } from '@/modules/whatsapp/webhook.handler'
import { GET, POST } from '@/app/(whatsapp)/whatsapp/route'

const APP_SECRET = 'test-app-secret'
const VERIFY_TOKEN = 'test-verify-token'

/** Simulates the DB unique constraint on messageId across payload.create calls */
const seenMessageIds = new Set<string>()

const sign = (rawBody: string, secret = APP_SECRET): string =>
  `sha256=${crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')}`

const webhookBody = (messageId: string, overrides: Record<string, unknown> = {}): string =>
  JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550001111',
                phone_number_id: '111222333',
              },
              contacts: [{ profile: { name: 'Test User' }, wa_id: '5215500000000' }],
              messages: [
                {
                  id: messageId,
                  from: '5215500000000',
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: 'text',
                  text: { body: 'hola' },
                  ...overrides,
                },
              ],
            },
          },
        ],
      },
    ],
  })

const postRequest = (rawBody: string, signature?: string): Request =>
  new Request('http://localhost:3000/whatsapp', {
    method: 'POST',
    headers: signature ? { 'x-hub-signature-256': signature } : {},
    body: rawBody,
  })

describe('WhatsApp webhook', () => {
  beforeAll(() => {
    process.env.WHATSAPP_APP_SECRET = APP_SECRET
    process.env.WHATSAPP_VERIFY_TOKEN = VERIFY_TOKEN
    process.env.WHATSAPP_ACCESS_TOKEN = 'env-access-token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = 'env-phone-number-id'
  })

  beforeEach(() => {
    vi.mocked(sendTextMessage).mockClear()
    mockPayload.find.mockReset()
    mockPayload.create.mockReset()

    // Default: no account in DB (env fallback), unique constraint on inbound messageId
    mockPayload.find.mockResolvedValue({ docs: [] })
    mockPayload.create.mockImplementation(async ({ data }: { data: { messageId: string } }) => {
      if (seenMessageIds.has(data.messageId)) {
        throw new Error(`duplicate key value violates unique constraint (${data.messageId})`)
      }
      seenMessageIds.add(data.messageId)
      return { id: 1, ...data }
    })
  })

  describe('verifyWebhookSignature', () => {
    it('accepts a valid signature', () => {
      const body = '{"object":"whatsapp_business_account"}'
      expect(verifyWebhookSignature(body, sign(body), APP_SECRET)).toBe(true)
    })

    it('rejects a signature computed over a tampered body', () => {
      const body = '{"object":"whatsapp_business_account"}'
      expect(verifyWebhookSignature(body + ' ', sign(body), APP_SECRET)).toBe(false)
    })

    it('rejects a signature from the wrong secret', () => {
      const body = '{}'
      expect(verifyWebhookSignature(body, sign(body, 'other-secret'), APP_SECRET)).toBe(false)
    })

    it('rejects a missing header', () => {
      expect(verifyWebhookSignature('{}', null, APP_SECRET)).toBe(false)
    })

    it('rejects a malformed header', () => {
      expect(verifyWebhookSignature('{}', 'md5=abc', APP_SECRET)).toBe(false)
      expect(verifyWebhookSignature('{}', 'sha256=not-hex!', APP_SECRET)).toBe(false)
    })
  })

  describe('staleness', () => {
    it('flags messages older than 10 minutes as stale', () => {
      const now = Date.now()
      const fresh = String(Math.floor(now / 1000))
      const old = String(Math.floor(now / 1000) - 11 * 60)
      expect(isStale(fresh, now)).toBe(false)
      expect(isStale(old, now)).toBe(true)
    })
  })

  describe('GET (verification handshake)', () => {
    it('returns the challenge when the verify token matches', async () => {
      const res = await GET(
        new Request(
          `http://localhost:3000/whatsapp?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=12345`,
        ),
      )
      expect(res.status).toBe(200)
      expect(await res.text()).toBe('12345')
    })

    it('returns 403 when the verify token does not match', async () => {
      const res = await GET(
        new Request(
          'http://localhost:3000/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345',
        ),
      )
      expect(res.status).toBe(403)
    })
  })

  describe('POST (incoming messages)', () => {
    it('persists the inbound message, replies, and logs the outbound message', async () => {
      const body = webhookBody('wamid.post-ok')
      const res = await POST(postRequest(body, sign(body)))

      expect(res.status).toBe(200)
      expect(sendTextMessage).toHaveBeenCalledTimes(1)
      // Env fallback credentials (no account in DB)
      expect(vi.mocked(sendTextMessage).mock.calls[0][0]).toEqual({
        accessToken: 'env-access-token',
        phoneNumberId: 'env-phone-number-id',
      })
      expect(vi.mocked(sendTextMessage).mock.calls[0][1]).toBe('5215500000000')

      // Two docs: inbound + outbound
      expect(mockPayload.create).toHaveBeenCalledTimes(2)
      const [inbound, outbound] = mockPayload.create.mock.calls.map((c) => c[0].data)
      expect(inbound).toMatchObject({
        messageId: 'wamid.post-ok',
        direction: 'inbound',
        status: 'received',
        waFrom: '5215500000000',
        profileName: 'Test User',
        body: 'hola',
      })
      expect(outbound).toMatchObject({
        messageId: 'wamid.outbound-test',
        direction: 'outbound',
        status: 'sent',
        waTo: '5215500000000',
      })
    })

    it('uses the account credentials when a matching active account exists', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [
          { id: 7, phoneNumberId: '111222333', accessToken: 'account-token', status: 'active' },
        ],
      })

      const body = webhookBody('wamid.post-account')
      await POST(postRequest(body, sign(body)))

      expect(vi.mocked(sendTextMessage).mock.calls[0][0]).toEqual({
        accessToken: 'account-token',
        phoneNumberId: '111222333',
      })
      // Both log docs linked to the account
      const datas = mockPayload.create.mock.calls.map((c) => c[0].data)
      expect(datas[0].account).toBe(7)
      expect(datas[1].account).toBe(7)
    })

    it('replies only once to a redelivered (duplicate) message', async () => {
      const body = webhookBody('wamid.post-dup')
      await POST(postRequest(body, sign(body)))
      await POST(postRequest(body, sign(body)))

      expect(sendTextMessage).toHaveBeenCalledTimes(1)
      // 3 creates: inbound + outbound on first delivery, rejected inbound on redelivery
      expect(mockPayload.create).toHaveBeenCalledTimes(3)
    })

    it('logs the outbound message as failed when sending throws', async () => {
      vi.mocked(sendTextMessage).mockRejectedValueOnce(new Error('network down'))

      const body = webhookBody('wamid.post-send-fail')
      const res = await POST(postRequest(body, sign(body)))

      expect(res.status).toBe(200)
      const outbound = mockPayload.create.mock.calls[1][0].data
      expect(outbound.direction).toBe('outbound')
      expect(outbound.status).toBe('failed')
    })

    it('drops an invalid signature with 200 and touches nothing', async () => {
      const body = webhookBody('wamid.post-bad-sig')
      const res = await POST(postRequest(body, sign(body, 'other-secret')))

      expect(res.status).toBe(200)
      expect(sendTextMessage).not.toHaveBeenCalled()
      expect(mockPayload.create).not.toHaveBeenCalled()
    })

    it('drops a missing signature with 200 and touches nothing', async () => {
      const body = webhookBody('wamid.post-no-sig')
      const res = await POST(postRequest(body))

      expect(res.status).toBe(200)
      expect(sendTextMessage).not.toHaveBeenCalled()
      expect(mockPayload.create).not.toHaveBeenCalled()
    })

    it('ignores non-text messages', async () => {
      const body = webhookBody('wamid.post-sticker', { type: 'sticker', text: undefined })
      const res = await POST(postRequest(body, sign(body)))

      expect(res.status).toBe(200)
      expect(sendTextMessage).not.toHaveBeenCalled()
      expect(mockPayload.create).not.toHaveBeenCalled()
    })
  })
})
