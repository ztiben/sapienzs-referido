/**
 * Types for the WhatsApp Cloud API webhook payload (Meta Graph API).
 * Only the fields the bot actually consumes are modeled.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
 */

export interface WhatsAppIncomingMessage {
  /** WhatsApp message ID (wamid.*) — unique per message, used for dedup */
  id: string
  /** Sender phone number in international format, no "+" */
  from: string
  /** Unix timestamp (seconds) as string */
  timestamp: string
  /** Message type: 'text' | 'image' | 'audio' | 'sticker' | 'interactive' | ... */
  type: string
  text?: { body: string }
}

export interface WhatsAppWebhookChangeValue {
  messaging_product?: string
  /** Identifies the business number that received the event — multi-tenant routing key */
  metadata?: {
    display_phone_number?: string
    phone_number_id?: string
  }
  messages?: WhatsAppIncomingMessage[]
  /** Delivery/read receipts for outbound messages — ignored by the bot */
  statuses?: unknown[]
  contacts?: Array<{ profile: { name: string }; wa_id: string }>
}

export interface WhatsAppWebhookBody {
  object: string
  entry?: Array<{
    id: string
    changes?: Array<{ field: string; value: WhatsAppWebhookChangeValue }>
  }>
}
