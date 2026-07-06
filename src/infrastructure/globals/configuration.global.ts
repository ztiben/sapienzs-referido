import type { GlobalConfig } from 'payload'

import { publicAccess } from '@/infrastructure/access/public.access'
import { features } from '@/infrastructure/features'

export const Configuration: GlobalConfig = {
  slug: 'configuration',
  label: 'Configuración',
  access: {
    read: publicAccess,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'shop',
          label: {
            en: 'Shop',
            es: 'Tienda',
          },
          fields: [
            {
              name: 'defaultShopType',
              type: 'select',
              required: true,
              defaultValue: features.services ? 'services' : 'products',
              label: {
                en: 'Default items to show in shop page',
                es: 'Ítems para mostrar de primeros en la página de tienda',
              },
              options: [
                ...(features.products
                  ? [
                      {
                        label: {
                          en: 'Products',
                          es: 'Productos',
                        },
                        value: 'products',
                      },
                    ]
                  : []),
                ...(features.services
                  ? [
                      {
                        label: {
                          en: 'Services',
                          es: 'Servicios',
                        },
                        value: 'services',
                      },
                    ]
                  : []),
              ],
              admin: {
                condition: () => features.products && features.services,
              },
            },
          ],
        },
        {
          name: 'whatsapp',
          label: {
            en: 'WhatsApp',
            es: 'WhatsApp',
          },
          fields: [
            {
              name: 'whatsAppNumber',
              type: 'text',
              label: {
                en: 'WhatsApp number',
                es: 'Número de WhatsApp',
              },
              admin: {
                description: {
                  en: 'WhatsApp number used if you enable the option to redirect to WhatsApp in Products or Services. International format without +, e.g. 573001234567',
                  es: 'Número de WhatsApp usado si se habilita la opción de redirigir a WhatsApp en Productos o Servicios. Formato internacional sin +, ej. 573001234567',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
