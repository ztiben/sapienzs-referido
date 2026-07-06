import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { publicAccess } from '@/infrastructure/access/public.access'
import { address } from '@/infrastructure/fields/address.field'
import { checkBusinessLogic } from './hooks/check-bl'

export const Stores: CollectionConfig = {
  slug: 'stores',
  labels: {
    singular: {
      en: 'Store',
      es: 'Tienda',
    },
    plural: {
      en: 'Stores',
      es: 'Tiendas',
    },
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    group: {
      en: 'Services',
      es: 'Servicios',
    },
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'services'],
  },
  fields: [
    {
      name: 'name',
      label: {
        en: 'Name',
        es: 'Nombre',
      },
      type: 'text',
      required: true,
      unique: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Address',
            es: 'Dirección',
          },
          fields: address,
        },
        {
          label: {
            en: 'Assignments',
            es: 'Asignaciones',
          },
          fields: [
            {
              name: 'services',
              label: {
                en: 'Services',
                es: 'Servicios',
              },
              type: 'relationship',
              relationTo: 'services',
              hasMany: true,
            },
            {
              name: 'bookings',
              label: {
                en: 'Bookings',
                es: 'Reservas',
              },
              type: 'join',
              collection: 'bookings',
              on: 'store',
              admin: {
                allowCreate: false,
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [checkBusinessLogic],
  },
}
