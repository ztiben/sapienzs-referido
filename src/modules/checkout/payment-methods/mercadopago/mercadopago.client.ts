import { PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'

export const mercadopagoAdapterClient: PaymentAdapterClient = {
  name: 'mercadopago',
  label: 'Mercado Pago',
  initiatePayment: true,
  confirmOrder: true,
}
