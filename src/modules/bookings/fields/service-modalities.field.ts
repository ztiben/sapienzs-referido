import type { SelectField } from 'payload'

export const serviceModalities = (): SelectField => ({
  name: 'modalities',
  label: {
    en: 'Modalities',
    es: 'Modalidades',
  },
  type: 'select',
  hasMany: true,
  defaultValue: [],
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
})
