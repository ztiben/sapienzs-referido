import { publicAccess } from '@/infrastructure/access/public.access'
import { currenciesConfig } from '@/infrastructure/currencies/currencies.config'
import { pricesField } from '@payloadcms/plugin-ecommerce'
import type { CollectionConfig } from 'payload'

export const Cities: CollectionConfig = {
  slug: 'cities',
  labels: {
    singular: { en: 'City', es: 'Ciudad' },
    plural: { en: 'Cities', es: 'Ciudades' },
  },
  access: {
    read: publicAccess,
  },
  admin: {
    hidden: true,
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { en: 'Name', es: 'Nombre' },
      required: true,
    },
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'countries',
      label: { en: 'Country', es: 'País' },
      required: true,
      index: true,
    },
    ...pricesField({ currenciesConfig }),
  ],
}
