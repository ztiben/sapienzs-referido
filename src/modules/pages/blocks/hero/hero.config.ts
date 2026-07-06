import type { Field } from 'payload'

import {
    FixedToolbarFeature,
    HeadingFeature,
    InlineToolbarFeature,
    lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/infrastructure/fields/link-group.field'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'none',
      label: {
        en: 'Type',
        es: 'Tipo',
      },
      options: [
        {
          label: {
            en: 'None',
            es: 'Ninguno',
          },
          value: 'none',
        },
        {
          label: {
            en: 'High impact',
            es: 'Alto impacto',
          },
          value: 'highImpact',
        },
        {
          label: {
            en: 'Medium impact',
            es: 'Medio impacto',
          },
          value: 'mediumImpact',
        },
      ],
      required: true,
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
      admin: {
        condition: (_, { type } = {}) => type !== 'none',
      },
    },
    linkGroup({
      overrides: {
        maxRows: 2,
        admin: {
          condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
        },
      },
    }),
    {
      name: 'media',
      label: {
        en: 'Media desktop',
        es: 'Archivo escritorio',
      },
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact'].includes(type),
        description: {
          es: 'Archivo que se usará cuando se visualice la página desde un dispositivo de escritorio. Se recomienda una relación de aspecto de 16:9 para esta sección.',
          en: 'File that will be used when the page is viewed from a desktop device. A 16:9 aspect ratio is recommended for this section.',
        },
      },
      filterOptions: {
        or: [{ mimeType: { contains: 'image' } }, { mimeType: { contains: 'video' } }],
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'mediaMobile',
      label: {
        en: 'Media mobile',
        es: 'Archivo móvil',
      },
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact'].includes(type),
        description: {
          es: 'Archivo que se usará cuando se visualice la página desde celular. Se recomienda una relación de aspecto de 9:16 para esta sección.',
          en: 'File that will be used when the page is viewed from a mobile device. A 9:16 aspect ratio is recommended for this section.',
        },
      },
      filterOptions: {
        or: [{ mimeType: { contains: 'image' } }, { mimeType: { contains: 'video' } }],
      },
      relationTo: 'media',
    },
  ],
  label: false,
}
