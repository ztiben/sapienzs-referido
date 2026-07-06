import type { Plugin } from 'payload'

import { MercadoPagoPayment } from '@/modules/checkout/globals/mercadopago-payment.global'
import { WhatsAppPayment } from '@/modules/checkout/globals/whatsapp-payment.global'

export const productsPlugin: Plugin = (config) => ({
  ...config,
  globals: [...(config.globals || []), MercadoPagoPayment, WhatsAppPayment],
})
