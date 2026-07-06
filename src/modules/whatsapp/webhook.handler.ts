import crypto from 'crypto'
import type { Payload } from 'payload'

import type { WhatsappAccount } from '@/payload-types'
import { WHATSAPP_ACCOUNTS_SLUG, WHATSAPP_MESSAGES_SLUG } from './constants/whatsapp.constants'
import { getWhatsAppConfig } from './whatsapp-config.util'
import { sendTextMessage, type WhatsAppCredentials } from './whatsapp.client'
import type { WhatsAppIncomingMessage, WhatsAppWebhookBody } from './whatsapp.model'

/** Messages older than this are dropped (anti-replay after downtime) */
const MESSAGE_TTL_MS = 10 * 60 * 1000

/** True when the message's Unix timestamp (seconds) is older than the TTL */
export const isStale = (timestamp: string, now = Date.now()): boolean =>
  now - Number(timestamp) * 1000 > MESSAGE_TTL_MS

const buildWelcomeMessage = (): string => {
  const company = process.env.COMPANY_NAME
  const who = company ? `el asistente de ${company}` : 'tu asistente virtual'
  return `👋 ¡Hola! Soy ${who}. Muy pronto podrás agendar citas y consultar nuestro catálogo por aquí.`
}

/** Finds the active tenant account matching the receiving business number */
const resolveAccount = async (
  payload: Payload,
  phoneNumberId: string | undefined,
): Promise<WhatsappAccount | null> => {
  if (!phoneNumberId) return null

  const result = await payload.find({
    collection: WHATSAPP_ACCOUNTS_SLUG,
    where: {
      and: [{ phoneNumberId: { equals: phoneNumberId } }, { status: { equals: 'active' } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

/** Account credentials, or env credentials as fallback (test number without a DB account) */
const resolveCredentials = (account: WhatsappAccount | null): WhatsAppCredentials | null => {
  if (account) return { accessToken: account.accessToken, phoneNumberId: account.phoneNumberId }

  try {
    const { accessToken, phoneNumberId } = getWhatsAppConfig()
    console.warn('[WhatsApp] No account matched — falling back to env credentials (test mode)')
    return { accessToken, phoneNumberId }
  } catch {
    console.error('[WhatsApp] No account matched and env credentials not configured — dropping')
    return null
  }
}

const isUniqueViolation = (error: unknown): boolean => {
  const text =
    error instanceof Error
      ? `${error.message} ${JSON.stringify('data' in error ? error.data : '')}`
      : String(error)
  return /unique|duplicate/i.test(text)
}

/**
 * Persists the inbound message. Returns false when it was already processed:
 * the unique constraint on messageId is the dedup mechanism (same DB-constraint
 * pattern as create-order-from-payment.handler.ts) — Meta redelivers webhooks.
 */
const registerInboundMessage = async (
  payload: Payload,
  message: WhatsAppIncomingMessage,
  account: WhatsappAccount | null,
  waTo: string | undefined,
  profileName: string | undefined,
): Promise<boolean> => {
  try {
    await payload.create({
      collection: WHATSAPP_MESSAGES_SLUG,
      overrideAccess: true,
      data: {
        messageId: message.id,
        direction: 'inbound',
        status: 'received',
        account: account?.id ?? null,
        waFrom: message.from,
        waTo: waTo ?? null,
        profileName: profileName ?? null,
        type: message.type,
        body: message.text?.body ?? null,
        messageTimestamp: new Date(Number(message.timestamp) * 1000).toISOString(),
      },
    })
    return true
  } catch (error) {
    if (isUniqueViolation(error)) {
      console.log(`[WhatsApp] Skipping duplicate message ${message.id}`)
      return false
    }
    throw error
  }
}

const logOutboundMessage = async (
  payload: Payload,
  data: {
    messageId: string | null
    account: WhatsappAccount | null
    waFrom: string | undefined
    waTo: string
    body: string
    status: 'sent' | 'failed'
  },
): Promise<void> => {
  try {
    await payload.create({
      collection: WHATSAPP_MESSAGES_SLUG,
      overrideAccess: true,
      data: {
        messageId: data.messageId ?? `out_${crypto.randomUUID()}`,
        direction: 'outbound',
        status: data.status,
        account: data.account?.id ?? null,
        waFrom: data.waFrom ?? null,
        waTo: data.waTo,
        type: 'text',
        body: data.body,
        messageTimestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[WhatsApp] Failed to log outbound message:', error)
  }
}

/**
 * Processes an already signature-verified webhook body.
 * Multi-tenant: routes by metadata.phone_number_id to the matching whatsapp-account.
 * Persists inbound/outbound messages; the unique messageId provides dedup.
 * Milestone 2 behavior: replies with a fixed welcome message to incoming text messages.
 */
export const handleWebhookBody = async (
  payload: Payload,
  body: WhatsAppWebhookBody,
): Promise<void> => {
  if (body.object !== 'whatsapp_business_account') {
    console.log(`[WhatsApp] Ignoring webhook object "${body.object}"`)
    return
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      const messages = value?.messages
      if (!messages?.length) continue // delivery/read statuses or other events

      const phoneNumberId = value.metadata?.phone_number_id
      const waTo = value.metadata?.display_phone_number ?? phoneNumberId
      const profileName = value.contacts?.[0]?.profile?.name
      const account = await resolveAccount(payload, phoneNumberId)

      for (const message of messages) {
        if (message.type !== 'text') {
          console.log(
            `[WhatsApp] Skipping non-text message type "${message.type}" from ${message.from}`,
          )
          continue
        }
        if (isStale(message.timestamp)) {
          console.log(`[WhatsApp] Skipping stale message ${message.id} (ts=${message.timestamp})`)
          continue
        }

        const isNew = await registerInboundMessage(payload, message, account, waTo, profileName)
        if (!isNew) continue

        const credentials = resolveCredentials(account)
        if (!credentials) continue

        const welcome = buildWelcomeMessage()
        console.log(`[WhatsApp] Text message from ${message.from} → sending welcome`)

        try {
          const sentMessageId = await sendTextMessage(credentials, message.from, welcome)
          await logOutboundMessage(payload, {
            messageId: sentMessageId,
            account,
            waFrom: waTo,
            waTo: message.from,
            body: welcome,
            status: 'sent',
          })
        } catch (error) {
          console.error(`[WhatsApp] Failed to send welcome to ${message.from}:`, error)
          await logOutboundMessage(payload, {
            messageId: null,
            account,
            waFrom: waTo,
            waTo: message.from,
            body: welcome,
            status: 'failed',
          })
        }
      }
    }
  }
}
