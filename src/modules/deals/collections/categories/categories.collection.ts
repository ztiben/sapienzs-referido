import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: {
      en: 'Category',
      es: 'Categoría',
    },
    plural: {
      en: 'Categories',
      es: 'Categorías',
    },
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    group: {
      en: 'Catalog',
      es: 'Catálogo',
    },
  },
  fields: [
    {
      name: 'title',
      label: {
        en: 'Title',
        es: 'Título',
      },
      type: 'text',
      required: true,
      localized: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
