import { adminOnly } from '@/infrastructure/access/admin-only.access'
import type { CollectionConfig } from 'payload'
import { weekDaysSelectField } from '../fields/week-days-select.field'

export const StaffBlocks: CollectionConfig = {
  slug: 'staff-blocks',
  labels: {
    singular: {
      en: 'Schedule Block',
      es: 'Bloqueo de agenda',
    },
    plural: {
      en: 'Schedule Blocks',
      es: 'Bloqueos de agenda',
    },
  },
  access: {
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'startTime',
    hidden: true,
  },
  fields: [
    {
      name: 'reason',
      label: {
        en: 'Reason',
        es: 'Motivo',
      },
      type: 'text',
    },
    {
      name: 'startTime',
      label: {
        en: 'Start time',
        es: 'Hora de inicio',
      },
      required: true,
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'timeOnly',
        },
      },
    },
    {
      name: 'endTime',
      label: {
        en: 'End time',
        es: 'Hora de fin',
      },
      required: true,
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'timeOnly',
          timeIntervals: 15,
        },
      },
    },
    weekDaysSelectField({
      name: 'repeat',
      label: {
        en: 'Repeat',
        es: 'Repetir',
      },
      defaultValue: [],
    }),
    {
      name: 'staff',
      label: {
        en: 'Staff',
        es: 'Profesional',
      },
      type: 'relationship',
      relationTo: 'staff',
      required: true,
      index: true,
    },
  ],
  indexes: [{ fields: ['staff'] }],
}
