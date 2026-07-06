import type { GlobalConfig } from 'payload'

import { link } from '@/infrastructure/fields/link.field'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      maxRows: 3,
      labels: {
        singular: { en: 'Column', es: 'Columna' },
        plural: { en: 'Columns', es: 'Columnas' },
      },
      fields: [
        {
          name: 'links',
          type: 'array',
          maxRows: 6,
          fields: [
            link({
              appearances: false,
            }),
          ],
        },
      ],
    },
  ],
}
