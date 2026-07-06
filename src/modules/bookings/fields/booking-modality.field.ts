import type { SelectField } from 'payload'

export const bookingModality = (): SelectField => ({
  name: 'modality',
  label: {
    en: 'Modality',
    es: 'Modalidad',
  },
  type: 'select',
  options: [
    {
      label: {
        en: 'In store',
        es: 'En tienda',
      },
      value: 'inStore',
    },
    {
      label: {
        en: 'Delivery',
        es: 'A domicilio',
      },
      value: 'delivery',
    },
  ],
  required: true,
})
