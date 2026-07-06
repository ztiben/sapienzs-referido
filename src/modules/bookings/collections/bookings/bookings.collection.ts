import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { isDocumentOwnerFieldAccess } from '@/infrastructure/access/is-document-owner-field.access'
import { isDocumentOwner } from '@/infrastructure/access/is-document-owner.access'
import { publicAccess } from '@/infrastructure/access/public.access'
import { bookingModality } from '@/modules/bookings/fields/booking-modality.field'
import type { CollectionConfig } from 'payload'
import { assignCustomer } from './hooks/assign-customer'
import { assignEndDatetime } from './hooks/assign-end-datetime'
import { checkBusinessLogic } from './hooks/check-bl'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: {
      en: 'Booking',
      es: 'Reserva',
    },
    plural: {
      en: 'Bookings',
      es: 'Reservas',
    },
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: isDocumentOwner,
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    group: {
      en: 'Services',
      es: 'Servicios',
    },
    defaultColumns: ['datetime', 'staff', 'service', 'customer'],
  },
  fields: [
    {
      name: 'customer',
      label: {
        en: 'Customer',
        es: 'Cliente',
      },
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        read: isDocumentOwnerFieldAccess,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Schedule',
            es: 'Agenda',
          },
          fields: [
            {
              name: 'startDatetime',
              label: {
                en: 'Start Datetime',
                es: 'Fecha y hora de inicio',
              },
              type: 'date',
              required: true,
              index: true,
              validate: (value) => {
                if (!value) {
                  return true
                }
                const bookingTime = new Date(value as unknown as string).getTime()
                if (isNaN(bookingTime)) {
                  return 'Invalid datetime'
                }
                return bookingTime > Date.now() || 'Booking datetime must be in the future'
              },
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                  timeIntervals: 15,
                },
              },
            },
            {
              name: 'endDatetime',
              label: {
                en: 'End Datetime',
                es: 'Fecha y hora de finalización',
              },
              type: 'date',
              required: true,
              index: true,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'service',
              label: {
                en: 'Service',
                es: 'Servicio',
              },
              type: 'relationship',
              relationTo: 'services',
              required: true,
              index: true,
            },
            {
              name: 'staff',
              label: {
                en: 'Staff',
                es: 'Trabajador',
              },
              type: 'relationship',
              relationTo: 'staff',
              required: true,
              index: true,
            },
          ],
        },
        {
          label: {
            en: 'Location',
            es: 'Ubicación',
          },
          fields: [
            bookingModality(),
            {
              name: 'store',
              label: {
                en: 'Store',
                es: 'Tienda',
              },
              type: 'relationship',
              relationTo: 'stores',
              index: true,
              validate: (
                value: unknown,
                { siblingData }: { siblingData: Record<string, unknown> },
              ) =>
                siblingData?.modality !== 'inStore' ||
                Boolean(value) ||
                'Store is required for in-store bookings',
              admin: {
                condition: ({ modality }) => modality === 'inStore',
              },
            },
            {
              name: 'address',
              label: {
                en: 'Address',
                es: 'Dirección',
              },
              type: 'relationship',
              relationTo: 'addresses',
              validate: (
                value: unknown,
                { siblingData }: { siblingData: Record<string, unknown> },
              ) =>
                siblingData?.modality !== 'delivery' ||
                Boolean(value) ||
                'Address is required for delivery bookings',
              admin: {
                condition: ({ modality }) => modality === 'delivery',
              },
            },
          ],
        },
      ],
    },
  ],
  indexes: [
    {
      fields: ['staff', 'startDatetime'],
    },
    {
      fields: ['customer', 'startDatetime'],
    },
    {
      fields: ['service', 'startDatetime'],
    },
    {
      fields: ['store', 'startDatetime'],
    },
  ],
  hooks: {
    beforeValidate: [assignEndDatetime],
    beforeChange: [assignCustomer, checkBusinessLogic],
  },
}
