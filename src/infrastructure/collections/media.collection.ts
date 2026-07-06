import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      en: 'Media',
      es: 'Archivo',
    },
    plural: {
      en: 'Media',
      es: 'Archivos',
    },
  },
  admin: {
    group: {
      en: 'Content',
      es: 'Contenido',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
  },
  hooks: {
    beforeChange: [
      ({ req }) => {
        const MAX_SIZE = 24 * 1024 * 1024 // 24MB
        if (req.file && req.file.data.length > MAX_SIZE) {
          throw new APIError('El archivo excede el límite de 24MB', 400)
        }
      },
    ],
  },
}
