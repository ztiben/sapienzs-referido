import type { Field } from 'payload'

type FieldsOverride = (args: { defaultFields: Field[] }) => Field[]

export const address: Field[] = [
  {
    name: 'phone',
    label: {
      en: 'Phone',
      es: 'Teléfono',
    },
    type: 'text',
  },
  {
    name: 'addressLine1',
    label: {
      en: 'Address Line',
      es: 'Dirección',
    },
    type: 'text',
    required: true,
  },
  {
    name: 'city',
    label: {
      en: 'City',
      es: 'Ciudad',
    },
    type: 'text',
    required: true,
  },
  {
    name: 'state',
    label: {
      en: 'State',
      es: 'Departamento',
    },
    type: 'text',
  },
  {
    name: 'country',
    label: {
      en: 'Country',
      es: 'País',
    },
    type: 'text',
    required: true,
  },
  {
    name: 'postalCode',
    label: {
      en: 'Postal code',
      es: 'Código postal',
    },
    type: 'text',
  },
]

export const addressFields: FieldsOverride = () => [
  {
    name: 'name',
    type: 'text',
    required: true,
  },
  {
    name: 'company',
    type: 'text',
  },
  ...address,
]
