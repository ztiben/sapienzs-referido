/**
 * WhatsApp Cloud API webhook.
 * GET: Meta's verification handshake (hub.challenge).
 * POST: incoming messages — signature-verified, then always acked with 200
 * (invalid payloads are logged and dropped) to avoid Meta retry storms.
 */

import config from '@payload-config'
import { getPayload } from 'payload'

import { handleWebhookBody } from '@/modules/whatsapp/webhook.handler'
import { verifyWebhookSignature } from '@/modules/whatsapp/webhook-signature.util'
import type { WhatsAppWebhookBody } from '@/modules/whatsapp/whatsapp.model'

export const GET = async (req: Request): Promise<Response> => {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && verifyToken && token === verifyToken && challenge) {
    console.log('[WhatsApp] Webhook verified')
    return new Response(challenge, { status: 200 })
  }

  console.warn('[WhatsApp] Webhook verification failed', {
    mode,
    verifyToken: verifyToken ? 'SET' : 'NOT SET',
  })
  return new Response('Forbidden', { status: 403 })
}

export const POST = async (req: Request): Promise<Response> => {
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (!appSecret) {
    // Without the App Secret we cannot authenticate the payload: drop it, but ack
    // with 200 so Meta does not retry a request we will never be able to verify.
    console.error('[WhatsApp] WHATSAPP_APP_SECRET is not set — webhook dropped')
    return new Response('OK', { status: 200 })
  }

  // The signature is computed over the RAW body — read it before parsing
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256')

  if (!verifyWebhookSignature(rawBody, signature, appSecret)) {
    console.warn('[WhatsApp] Invalid webhook signature — dropped')
    return new Response('OK', { status: 200 })
  }

  try {
    const body = JSON.parse(rawBody) as WhatsAppWebhookBody
    const payload = await getPayload({ config })
    await handleWebhookBody(payload, body)
  } catch (error) {
    console.error('[WhatsApp] Error processing webhook:', error)
  }

  return new Response('OK', { status: 200 })
}
