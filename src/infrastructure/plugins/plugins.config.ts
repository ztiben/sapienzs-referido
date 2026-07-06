import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Plugin } from 'payload'

import { Deal, Page } from '@/payload-types'
import { getServerSideURL } from '@/shared/utils/get-url.util'

const generateTitle: GenerateTitle<Deal | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Sapyenzs Referido` : 'Sapyenzs Referido'
}

const generateURL: GenerateURL<Deal | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
      country: false,
      state: false,
    },
    formSubmissionOverrides: {
      labels: {
        singular: {
          en: 'Form Submission',
          es: 'Respuesta de Formulario',
        },
        plural: {
          en: 'Forms Submissions',
          es: 'Respuestas de Formularios',
        },
      },
      admin: {
        group: {
          en: 'Content',
          es: 'Contenido',
        },
      },
    },
    formOverrides: {
      labels: {
        singular: {
          en: 'Form',
          es: 'Formulario',
        },
        plural: {
          en: 'Forms',
          es: 'Formularios',
        },
      },
      admin: {
        group: {
          en: 'Content',
          es: 'Contenido',
        },
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  vercelBlobStorage({
    collections: {
      ['media']: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
    clientUploads: true,
  }),
]
