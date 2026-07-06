import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { adminOnlyFieldAccess } from '@/infrastructure/access/admin-only-field.access'

export const DealReports: CollectionConfig = {
  slug: 'deal-reports',
  labels: {
    singular: {
      en: 'Deal report',
      es: 'Reporte de oferta',
    },
    plural: {
      en: 'Deal reports',
      es: 'Reportes de ofertas',
    },
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: {
      en: 'Moderation',
      es: 'Moderación',
    },
    defaultColumns: ['deal', 'user', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'deal',
      label: {
        en: 'Deal',
        es: 'Oferta',
      },
      type: 'relationship',
      relationTo: 'deals',
      required: true,
      index: true,
    },
    {
      name: 'user',
      label: {
        en: 'Reported by',
        es: 'Reportada por',
      },
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      label: {
        en: 'Status',
        es: 'Estado',
      },
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: { en: 'Pending', es: 'Pendiente' }, value: 'pending' },
        { label: { en: 'Confirmed', es: 'Confirmado' }, value: 'confirmed' },
        { label: { en: 'Dismissed', es: 'Descartado' }, value: 'dismissed' },
      ],
      access: {
        create: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
    },
    {
      name: 'note',
      label: {
        en: 'Note',
        es: 'Nota',
      },
      type: 'textarea',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // The reporter is always the authenticated user, never client input.
        if (operation === 'create' && req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
}
