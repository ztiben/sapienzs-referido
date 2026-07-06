import type { Block } from 'payload'

import { relationTo } from '@/modules/pages/blocks/shared/utils/relation-to.util'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { showFromOptions } from '../shared/utils/show-from-options.util'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: {
        en: 'Intro Content',
        es: 'Contenido introductorio',
      },
    },
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
      name: 'showFrom',
      label: {
        en: 'Show from',
        es: 'Mostrar de',
      },
      type: 'select',
      defaultValue: showFromOptions[0].value,
      options: showFromOptions,
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'category',
      },
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
      defaultValue: 10,
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
  ],
  labels: {
    plural: {
      en: 'Catalogs',
      es: 'Catálogos',
    },
    singular: {
      en: 'Catalog',
      es: 'Catálogo',
    },
  },
}
