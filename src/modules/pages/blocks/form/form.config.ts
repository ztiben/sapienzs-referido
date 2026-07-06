import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      label: {
        en: 'Form to display',
        es: 'Formulario a mostrar',
      },
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: {
        en: 'Enable intro content',
        es: 'Habilitar contenido introductorio',
      },
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
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
        en: 'Intro content',
        es: 'Contenido introductorio',
      },
    },
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: {
      en: 'Forms',
      es: 'Formularios',
    },
    singular: {
      en: 'Form',
      es: 'Formulario',
    },
  },
}
