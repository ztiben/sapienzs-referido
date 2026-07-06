import { productsModule } from '@/infrastructure/access/products-module.access'
import type { GlobalConfig } from 'payload'

export const MercadoPagoPayment: GlobalConfig = {
  slug: 'mercadopago-payment',
  label: { en: 'MercadoPago', es: 'MercadoPago' },
  access: {
    read: productsModule,
    update: productsModule,
  },
  admin: {
    group: { en: 'Payment methods', es: 'Medios de pago' },
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Enabled', es: 'Habilitado' },
      admin: {
        description: {
          en: 'To use MercadoPago as a payment method, you must create a MercadoPago account and contact Zoren support to configure the integration.',
          es: 'Para que el medio de pago MercadoPago funcione correctamente, deberás crear una cuenta en MercadoPago y contactar al soporte de Zoren para configurar la integración.',
        },
      },
    },
  ],
}
