import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import { confirmOrder } from './confirm-order.handler'
import { initiatePayment } from './initiate-payment.handler'
import { webhookEndpoint } from './webhook.endpoint'

export const mercadopagoAdapter = (args: {
  accessToken: string
  webhookSecret: string
}): PaymentAdapter => {
  const { accessToken, webhookSecret } = args

  return {
    name: 'mercadopago',
    label: 'Mercado Pago',
    endpoints: [webhookEndpoint({ accessToken, webhookSecret })],
    group: {
      name: 'mercadopago',
      label: 'Mercado Pago',
      type: 'group',
      admin: {
        condition: (data) => data?.paymentMethod === 'mercadopago',
      },
      fields: [
        {
          name: 'preferenceId',
          type: 'text',
          label: 'Preference ID',
        },
        {
          name: 'paymentId',
          type: 'text',
          label: 'Payment ID',
        },
      ],
    },
    initiatePayment: initiatePayment({ accessToken, webhookSecret }),
    confirmOrder: confirmOrder({ accessToken }),
  }
}
