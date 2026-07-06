import { productsModule } from '@/infrastructure/access/products-module.access'
import type { GlobalConfig } from 'payload'

export const WhatsAppPayment: GlobalConfig = {
  slug: 'whatsapp-payment',
  label: 'WhatsApp',
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
    },
    {
      name: 'whatsAppNumber',
      type: 'text',
      label: { en: 'WhatsApp number', es: 'Número de WhatsApp' },
      admin: {
        description: {
          en: 'International format without +, e.g. 573001234567',
          es: 'Formato internacional sin +, ej. 573001234567',
        },
        condition: (data) => Boolean(data.enabled),
      },
    },
  ],
}
