import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import { MercadoPagoConfig, Payment } from 'mercadopago'

import { TRANSACTIONS_SLUG } from '@/shared/constants/transactions.constants'
import { createOrderFromPayment } from './create-order-from-payment.handler'

export const confirmOrder =
  (args: { accessToken: string }): NonNullable<PaymentAdapter>['confirmOrder'] =>
  async ({ data, req, transactionsSlug = TRANSACTIONS_SLUG }) => {
    const payload = req.payload
    const { accessToken } = args

    const paymentId = data.paymentId

    if (!accessToken) throw new Error('Access token required')
    if (!paymentId) throw new Error('Payment ID required')

    try {
      // 1. Fetch payment from MercadoPago
      const client = new MercadoPagoConfig({ accessToken })
      const payment = new Payment(client)
      const paymentResponse = await payment.get({ id: Number(paymentId) })

      if (!paymentResponse) {
        throw new Error('Payment not found')
      }

      // 2. Get transaction (fresh state)
      const transactionId = paymentResponse.external_reference
        ? Number(paymentResponse.external_reference)
        : null

      if (!transactionId) {
        throw new Error('No transaction reference')
      }

      const transaction = await payload.findByID({
        collection: transactionsSlug as typeof TRANSACTIONS_SLUG,
        id: transactionId,
        depth: 0,
        req,
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      // 3. If failed → error
      if (transaction.status === 'failed') {
        throw new Error('Payment rejected')
      }

      const customerEmail = paymentResponse.payer?.email ?? transaction.customerEmail

      // 4. If succeeded → return existing order
      if (transaction.status === 'succeeded') {
        const orderId =
          typeof transaction.order === 'number' ? transaction.order : transaction.order?.id

        return {
          message: 'Order confirmed successfully',
          orderID: orderId ?? 0,
          transactionID: transactionId,
          email: customerEmail,
        }
      }

      // 5. If pending
      if (transaction.status === 'pending') {
        // 5.2 Payment still pending or in process
        if (paymentResponse.status === 'pending' || paymentResponse.status === 'in_process') {
          return {
            message: 'Order being processed',
            status: 'pending',
            orderID: 0,
            transactionID: transactionId,
            email: customerEmail,
          }
        }

        // 5.3 Payment rejected
        if (paymentResponse.status === 'rejected') {
          await payload.update({
            collection: transactionsSlug as typeof TRANSACTIONS_SLUG,
            id: transactionId,
            data: { status: 'failed', mercadopago: { paymentId } },
            req,
          })
          throw new Error('Payment rejected')
        }

        // 5.4 Payment approved → create order
        if (paymentResponse.status === 'approved') {
          const result = await createOrderFromPayment({
            paymentResponse,
            transaction,
            paymentId: String(paymentId),
            payload,
            req,
          })

          if (result.success && result.orderID) {
            return {
              message: 'Order confirmed successfully',
              orderID: result.orderID,
              transactionID: transactionId,
              email: customerEmail,
            }
          }

          throw new Error(result.message)
        }
      }

      // 6. Fallback — should not be reached in normal flow
      payload.logger.error({
        msg: 'Unexpected state in confirmOrder',
        transactionStatus: transaction.status,
        mpPaymentStatus: paymentResponse.status,
        transactionId,
      })
      throw new Error('Unexpected payment state')
    } catch (error) {
      payload.logger.error({ err: error, msg: 'Error confirming order' })
      throw new Error(error instanceof Error ? error.message : 'Unknown error')
    }
  }
