import { TRANSACTIONS_SLUG } from '@/shared/constants/transactions.constants'
import type { Transaction } from '@/payload-types'
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes'
import type { Payload, PayloadRequest } from 'payload'

export interface CreateOrderParams {
  paymentResponse: PaymentResponse
  transaction: Transaction
  paymentId: string
  payload: Payload
  req: PayloadRequest
}

export interface CreateOrderResult {
  success: boolean
  message: string
  orderID?: number
  status?: number
}

/**
 * Creates an order from an approved Mercado Pago payment.
 * Used by both the webhook handler and confirmOrder to ensure
 * orders are created regardless of which fires first.
 *
 * Race condition protection: the unique constraint on orders.transaction
 * prevents duplicate orders. If a concurrent call already created the order,
 * the DB transaction is rolled back and the error is caught by the caller.
 */
export async function createOrderFromPayment({
  paymentResponse,
  transaction,
  paymentId,
  payload,
  req,
}: CreateOrderParams): Promise<CreateOrderResult> {
  // Read the snapshot from the Transaction record itself (persisted by
  // initiatePayment). Keeping it server-side instead of in MP's metadata
  // avoids the per-key size limits and the brittleness of JSON-stringified
  // payloads, and gives us a single source of truth that webhook and
  // confirmOrder both look at.
  const cartId = typeof transaction.cart === 'number' ? transaction.cart : transaction.cart?.id
  const cartItemsSnapshot = transaction.items
  const shippingAddressSnapshot = transaction.shippingAddress
  const shippingCost = transaction.shippingCost ?? undefined

  if (!cartId) {
    payload.logger.error({
      msg: 'Cart ID missing on transaction',
      paymentId,
      transactionId: transaction.id,
    })
    return { success: false, message: 'Cart ID not found' }
  }

  if (!cartItemsSnapshot || !Array.isArray(cartItemsSnapshot) || cartItemsSnapshot.length === 0) {
    payload.logger.error({
      msg: 'Transaction has no items snapshot',
      paymentId,
      transactionId: transaction.id,
    })
    return { success: false, message: 'Cart items invalid' }
  }

  // The Transaction collection allows shippingAddress subfields to be empty
  // so admins can record manual transactions. The MP path always populates
  // every required subfield (initiatePayment validates country/city up front),
  // so a missing field here means we're trying to convert a ledger-only
  // transaction into an Order, which the Order collection would reject anyway.
  if (
    !shippingAddressSnapshot ||
    typeof shippingAddressSnapshot !== 'object' ||
    !shippingAddressSnapshot.name ||
    !shippingAddressSnapshot.addressLine1 ||
    !shippingAddressSnapshot.city ||
    !shippingAddressSnapshot.country
  ) {
    payload.logger.error({
      msg: 'Transaction has no shipping address snapshot',
      paymentId,
      transactionId: transaction.id,
    })
    return { success: false, message: 'Shipping address not found or invalid' }
  }

  const shippingAddressForOrder = {
    ...shippingAddressSnapshot,
    name: shippingAddressSnapshot.name,
    addressLine1: shippingAddressSnapshot.addressLine1,
    city: shippingAddressSnapshot.city,
    country: shippingAddressSnapshot.country,
  }

  payload.logger.info({
    msg: `Payload req transaction ${req.transactionID}`,
  })

  // Begin a manual transaction to acquire a row-level lock
  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    payload.logger.error({ msg: 'Could not begin database transaction', paymentId })
    return { success: false, message: 'Could not begin transaction', status: 500 }
  }

  const customerEmail = paymentResponse.payer?.email ?? transaction.customerEmail

  try {
    // Create order within the transaction
    const order = await payload.create({
      collection: 'orders',
      data: {
        items: cartItemsSnapshot,
        shippingAddress: shippingAddressForOrder,
        shippingCost,
        ...(transaction.customer
          ? {
              customer:
                typeof transaction.customer === 'number'
                  ? transaction.customer
                  : transaction.customer.id,
            }
          : {}),
        customerEmail,
        transaction: transaction.id,
        status: 'processing',
        amount: paymentResponse.transaction_amount,
        currency:
          typeof paymentResponse.currency_id === 'string'
            ? (paymentResponse.currency_id.toUpperCase() as 'COP')
            : undefined,
      },
      req: { ...req, transactionID },
    })

    // Update transaction within the transaction
    await payload.update({
      id: transaction.id,
      collection: TRANSACTIONS_SLUG,
      data: {
        order: order.id,
        status: 'succeeded',
        mercadopago: { paymentId },
      },
      req: { ...req, transactionID },
    })

    const timestamp = new Date().toISOString()
    await payload.update({
      id: cartId,
      collection: 'carts',
      data: { purchasedAt: timestamp },
      req: { ...req, transactionID },
    })

    // Commit atomically — both order creation and transaction update land together
    await payload.db.commitTransaction(transactionID)

    return { success: true, orderID: order.id, message: 'Order created successfully' }
  } catch (error) {
    // Rollback — undoes order creation if it already ran within this transaction
    try {
      await payload.db.rollbackTransaction(transactionID)
    } catch (rollbackError) {
      payload.logger.error({
        err: rollbackError,
        msg: 'Failed to rollback transaction',
        transactionId: transaction.id,
      })
    }

    // If the error is a unique constraint violation, it means a concurrent
    // call (webhook or confirmOrder) already created the order for this transaction.
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
      payload.logger.info({
        msg: 'Order already created by concurrent process',
        transactionId: transaction.id,
        paymentId,
      })
      return { success: false, message: 'Order already being processed' }
    }

    throw error
  }
}
