import type { GlobalConfig } from 'payload'

import { publicAccess } from '@/infrastructure/access/public.access'

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
          name: 'site',
          label: {
            en: 'Site',
            es: 'Sitio',
          },
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
              label: {
                en: 'Contact email',
                es: 'Correo de contacto',
              },
            },
            {
              name: 'instagramUrl',
              type: 'text',
              label: {
                en: 'Instagram URL',
                es: 'URL de Instagram',
              },
            },
            {
              name: 'facebookUrl',
              type: 'text',
              label: {
                en: 'Facebook URL',
                es: 'URL de Facebook',
              },
            },
          ],
        },
      ],
    },
  ],
}
