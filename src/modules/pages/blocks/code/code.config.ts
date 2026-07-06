import type { Block } from 'payload'

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  labels: {
    plural: {
      en: 'Code snippets',
      es: 'Fragmentos de código',
    },
    singular: {
      en: 'Code snippet',
      es: 'Fragmento de código',
    },
  },
  fields: [
    {
      name: 'language',
      label: {
        en: 'Language',
        es: 'Lenguaje',
      },
      type: 'select',
      defaultValue: 'typescript',
      options: [
        {
          label: 'TypeScript',
          value: 'typescript',
        },
        {
          label: 'JavaScript',
          value: 'javascript',
        },
        {
          label: 'CSS',
          value: 'css',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
    },
  ],
}
