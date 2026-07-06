import type { Block } from 'payload'

import { relationTo } from '@/modules/pages/blocks/shared/utils/relation-to.util'

export const Carousel: Block = {
  slug: 'carousel',
  fields: [
    {
      name: 'populateBy',
      label: {
        en: 'Populate by',
        es: 'Rellenar por',
      },
      type: 'select',
      defaultValue: 'category',
      options: [
        {
          label: {
            en: 'Category',
            es: 'Categoría',
          },
          value: 'category',
        },
        {
          label: {
            en: 'Individual selection',
            es: 'Selección individual',
          },
          value: 'selection',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'category',
      },
      hasMany: true,
      label: {
        en: 'Categories to show',
        es: 'Categorías para mostrar',
      },
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'category',
        step: 1,
      },
      defaultValue: 3,
      label: {
        en: 'Limit',
        es: 'Límite',
      },
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: {
        en: 'Selection',
        es: 'Selección',
      },
      relationTo,
    },
    {
      name: 'populatedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'category',
        description: {
          en: 'This field is auto-populated after-read',
          es: 'Este campo se llena automáticamente después de la lectura',
        },
        disabled: true,
      },
      hasMany: true,
      label: {
        en: 'Documents to show',
        es: 'Documentos a mostrar',
      },
      relationTo,
    },
    {
      name: 'populatedDocsTotal',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'category',
        description: {
          en: 'This field is auto-populated after-read',
          es: 'Este campo se llena automáticamente después de la lectura',
        },
        disabled: true,
        step: 1,
      },
      label: {
        en: 'Populated docs total',
        es: 'Total de documentos poblados',
      },
    },
  ],
  interfaceName: 'CarouselBlock',
}
