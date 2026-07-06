import { publicAccess } from '@/infrastructure/access/public.access'
import type { CollectionConfig } from 'payload'

export const Countries: CollectionConfig = {
  slug: 'countries',
  labels: {
    singular: { en: 'Country', es: 'País' },
    plural: { en: 'Countries', es: 'Países' },
  },
  access: {
    read: publicAccess,
  },
  admin: {
    useAsTitle: 'name',
    group: { en: 'Coverage', es: 'Cobertura' },
    description: {
      es: 'La cobertura que configures determina qué países y ciudades pueden escoger los clientes a la hora de crear una dirección',
      en: 'The coverage you set determines which countries and cities customers can choose when creating an address',
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { en: 'Name', es: 'Nombre' },
      required: true,
      unique: true,
    },
    {
      name: 'cities',
      type: 'join',
      collection: 'cities',
      on: 'country',
      label: { en: 'Cities', es: 'Ciudades' },
    },
  ],
}
