import type { Block, Field } from 'payload'

import {
    FixedToolbarFeature,
    HeadingFeature,
    InlineToolbarFeature,
    lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/infrastructure/fields/link.field'

const columnFields: Field[] = [
  {
    name: 'size',
    label: {
      en: 'Size',
      es: 'Tamaño',
    },
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: {
          en: 'One third',
          es: 'Un tercio',
        },
        value: 'oneThird',
      },
      {
        label: {
          en: 'Half',
          es: 'Mitad',
        },
        value: 'half',
      },
      {
        label: {
          en: 'Two thirds',
          es: 'Dos tercios',
        },
        value: 'twoThirds',
      },
      {
        label: {
          en: 'Full',
          es: 'Completo',
        },
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
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
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: {
      en: 'Enable link',
      es: 'Habilitar enlace',
    },
  },
  link({
    overrides: {
      admin: {
        condition: (_: unknown, { enableLink }: { enableLink?: boolean }) => Boolean(enableLink),
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: {
    plural: {
      en: 'Text columns',
      es: 'Columnas de texto',
    },
    singular: {
      en: 'Text columns',
      es: 'Columnas de texto',
    },
  },
  fields: [
    {
      name: 'columns',
      label: {
        en: 'Columns',
        es: 'Columnas',
      },
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
