import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { publicAccess } from '@/infrastructure/access/public.access'
import { weekDaysSelectField } from '../../fields/week-days-select.field'
import { availabilityEndpoint } from './endpoints/availability.endpoint'

export const Staff: CollectionConfig = {
  slug: 'staff',
  labels: {
    singular: {
      en: 'Staff',
      es: 'Trabajador',
    },
    plural: {
      en: 'Staff',
      es: 'Trabajadores',
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
    defaultColumns: ['name', 'email', 'phone'],
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
            en: 'Profile',
            es: 'Perfil',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                },
                {
                  name: 'phone',
                  label: {
                    en: 'Phone',
                    es: 'Teléfono',
                  },
                  type: 'text',
                },
              ],
            },
            {
              name: 'bio',
              type: 'textarea',
            },
          ],
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
              name: 'stores',
              label: {
                en: 'Stores',
                es: 'Tiendas',
              },
              type: 'relationship',
              relationTo: 'stores',
              hasMany: true,
            },
            {
              name: 'offersDelivery',
              label: {
                en: 'Offers delivery',
                es: 'Ofrece servicio a domicilio',
              },
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          label: {
            en: 'Schedule',
            es: 'Agenda',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'workStartTime',
                  label: {
                    en: 'Working day start time',
                    es: 'Hora de inicio de jornada',
                  },
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'timeOnly',
                    },
                  },
                  // defaultValue: DEFAULT_WORK_START_HOUR,
                },
                {
                  name: 'workEndTime',
                  label: {
                    en: 'Working day end time',
                    es: 'Hora de finalización de jornada',
                  },
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'timeOnly',
                    },
                  },
                  // defaultValue: DEFAULT_WORK_END_HOUR,
                  // validate: (
                  //   value: number | null | undefined,
                  //   { siblingData }: { siblingData: Record<string, unknown> },
                  // ) => {
                  //   const start = siblingData?.workStartHour as number | null | undefined
                  //   if (value != null && start != null && value <= start) {
                  //     return 'Work end hour must be greater than work start hour'
                  //   }
                  //   return true
                  // },
                },
              ],
            },
            weekDaysSelectField(),
            {
              name: 'blocks',
              label: {
                en: 'Schedule Block',
                es: 'Bloqueo de agenda',
              },
              type: 'join',
              collection: 'staff-blocks',
              on: 'staff',
            },
          ],
        },
        {
          label: {
            en: 'Bookings',
            es: 'Reservas',
          },
          fields: [
            {
              name: 'bookings',
              label: {
                en: 'Bookings',
                es: 'Reservas',
              },
              type: 'join',
              collection: 'bookings',
              on: 'staff',
              admin: {
                allowCreate: false,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'photo',
      label: {
        en: 'Photo',
        es: 'Foto',
      },
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  endpoints: [availabilityEndpoint],
}
