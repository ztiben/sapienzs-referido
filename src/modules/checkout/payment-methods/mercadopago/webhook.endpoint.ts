import crypto from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import type { Endpoint, Payload, PayloadRequest } from 'payload'

import { TRANSACTIONS_SLUG } from '@/shared/constants/transactions.constants'
import { createOrderFromPayment } from './create-order-from-payment.handler'

interface WebhookVerificationParams {
  xSignature: string
  xRequestId: string
  dataId: string
  secret: string
  payload: Payload
}

/**
 * Verifies Mercado Pago webhook signature using HMAC-SHA256
 * According to MP documentation:
 * - Header x-signature format: "ts=1704908010,v1=618c85..."
 * - Manifest: "id:[data.id];request-id:[x-request-id];ts:[ts];"
 * - Signature: HMAC-SHA256(manifest, secret)
 */
export function verifyWebhookSignature({
  xSignature,
  xRequestId,
  dataId,
  secret,
  payload,
}: WebhookVerificationParams): boolean {
  try {
    // Parse x-signature header
    const parts = xSignature.split(',')

    let ts
    let hash

    parts.forEach((part) => {
      // Split each part into key and value
      const [key, value] = part.split('=')
      if (key && value) {
        const trimmedKey = key.trim()
        const trimmedValue = value.trim()
        if (trimmedKey === 'ts') {
          ts = trimmedValue
        } else if (trimmedKey === 'v1') {
          hash = trimmedValue
        }
      }
    })

    if (!ts || !hash) {
      payload.logger.error({ msg: `Parsing failed. Raw x-signature: ${xSignature}` })
      return false
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(manifest)
    const sha = hmac.digest('hex')

    payload.logger.info({
      msg: `ts=${ts} hash=${hash} manifest=${manifest} sha=${sha} rawHeader=${xSignature}`,
    })

    return sha === hash
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: 'Error verifying webhook signature',
    })
    return false
  }
}

interface WebhookResult {
  success: boolean
  message: string
  orderID?: number
  status?: number
}

interface HandlePaymentWebhookParams {
  paymentId: string
  accessToken: string
  webhookSecret: string
  req: PayloadRequest
}

export async function handlePaymentWebhook({
  paymentId,
  accessToken,
  webhookSecret,
  req,
}: HandlePaymentWebhookParams): Promise<WebhookResult> {
  const { payload } = req
  const xSignature = req.headers.get('x-signature') ?? ''
  const xRequestId = req.headers.get('x-request-id') ?? ''

  // 1. Verify signature. Acknowledge with 200 on failure: returning non-2xx
  // would make Mercado Pago retry forged or malformed deliveries every 15 min
  // indefinitely. The log is the audit trail.
  const isValid = verifyWebhookSignature({
    xSignature,
    xRequestId,
    dataId: paymentId,
    secret: webhookSecret,
    payload,
  })
  if (!isValid) {
    payload.logger.warn({ msg: 'Invalid Mercado Pago webhook signature', paymentId })
    return { success: false, message: 'Invalid signature' }
  }

  // 2. Fetch payment from MercadoPago
  const client = new MercadoPagoConfig({ accessToken })
  const payment = new Payment(client)
  const paymentResponse = await payment.get({ id: Number(paymentId) })

  if (!paymentResponse) {
    payload.logger.warn({ msg: 'Payment not found in MercadoPago', paymentId })
    return { success: false, message: 'Payment not found in MercadoPago' }
  }

  // 3. Get transaction from external_reference. Missing/unknown references are
  // ACKed with 200 — the resource is unknown to us and retries cannot fix it.
  const transactionId = paymentResponse.external_reference
  if (!transactionId) {
    payload.logger.warn({
      msg: 'Payment has no external_reference',
      paymentId,
      mpStatus: paymentResponse.status,
    })
    return { success: false, message: 'No transaction reference in payment' }
  }

  const transaction = await payload.findByID({
    collection: TRANSACTIONS_SLUG,
    id: transactionId,
    depth: 0,
    req,
  })

  if (!transaction) {
    payload.logger.warn({
      msg: 'Transaction not found in database',
      paymentId,
      transactionId,
    })
    return { success: false, message: 'Transaction not found' }
  }

  // 4. If already processed, skip
  if (transaction.status !== 'pending') {
    return { success: true, message: `Already processed: ${transaction.status}` }
  }

  // 5. If payment rejected → mark as failed
  if (paymentResponse.status === 'rejected') {
    await payload.update({
      collection: TRANSACTIONS_SLUG,
      id: transaction.id,
      data: {
        status: 'failed',
        mercadopago: { paymentId },
      },
      req,
    })
    return { success: true, message: 'Payment rejected' }
  }

  // 6. If payment approved → verify amount, then create order. An approved
  // payment whose amount diverges from the quoted transaction means tampering
  // or a stale notification for a superseded preference.
  if (paymentResponse.status === 'approved') {
    if (paymentResponse.transaction_amount !== transaction.amount) {
      payload.logger.error({
        msg: 'Payment amount mismatch — marking transaction failed',
        paymentId,
        transactionId,
        expected: transaction.amount,
        received: paymentResponse.transaction_amount,
      })
      await payload.update({
        collection: TRANSACTIONS_SLUG,
        id: transaction.id,
        data: {
          status: 'failed',
          mercadopago: { paymentId },
        },
        req,
      })
      return { success: false, message: 'Payment amount mismatch' }
    }

    return await createOrderFromPayment({
      paymentResponse,
      transaction,
      paymentId,
      payload,
      req,
    })
  }

  // 7. Payment still pending, in_process, or other status — acknowledge receipt
  payload.logger.info({
    msg: 'Payment not yet approved',
    paymentId,
    mpStatus: paymentResponse.status,
    transactionId,
  })
  return { success: true, message: `Payment status: ${paymentResponse.status}` }
}

interface WebhookEndpointArgs {
  accessToken: string
  webhookSecret: string
}

export const webhookEndpoint = ({ accessToken, webhookSecret }: WebhookEndpointArgs): Endpoint => ({
  path: '/webhooks',
  method: 'post',
  handler: async (req) => {
    const { payload } = req

    const xSignature = req.headers.get('x-signature')
    const xRequestId = req.headers.get('x-request-id')

    if (!xSignature || !xRequestId) {
      return Response.json({ error: 'Missing headers' }, { status: 400 })
    }

    const url = new URL(req.url ?? '')
    const dataId = url.searchParams.get('data.id')
    const notificationType = url.searchParams.get('type')

    if (!dataId) {
      return Response.json({ error: 'Missing data.id' }, { status: 400 })
    }

    if (notificationType !== 'payment') {
      return Response.json({ message: 'OK' })
    }

    try {
      const result = await handlePaymentWebhook({
        paymentId: dataId,
        accessToken,
        webhookSecret,
        req,
      })

      return Response.json(result, { status: result.status ?? 200 })
    } catch (error) {
      payload.logger.error({ err: error, msg: 'Webhook error' })
      return Response.json({ success: false, message: 'Error' }, { status: 500 })
    }
  },
})

