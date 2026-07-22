import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import {
  AlignFeature,
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from '@/infrastructure/collections/media.collection'
import { Footer } from '@/infrastructure/footer/footer.global'
import { Configuration } from '@/infrastructure/globals/configuration.global'
import { Header } from '@/infrastructure/header/header.global'
import { Users } from '@/modules/auth/collections/auth/auth.collection'
import { Categories } from '@/modules/deals/collections/categories/categories.collection'
import { DealReports } from '@/modules/deals/collections/deal-reports/deal-reports.collection'
import { Deals } from '@/modules/deals/collections/deals/deals.collection'
import { Favorites } from '@/modules/deals/collections/favorites/favorites.collection'
import { Subscribers } from '@/modules/newsletter/collections/subscribers/subscribers.collection'
import { Pages } from '@/modules/pages/collections/pages.collection'
import { Retailers } from '@/modules/retailers/collections/retailers.collection'
import { plugins } from './infrastructure/plugins/plugins.config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Pages, Categories, Media, Retailers, Deals, Favorites, DealReports, Subscribers],
  db: vercelPostgresAdapter({
    // In production Payload disables schema `push` by default. Setting
    // PAYLOAD_DB_PUSH=true forces it on so the very first Vercel deploy can
    // create the schema on an empty Neon database (all CREATE TABLE, runs
    // non-interactively). Before launch, switch to migrations and unset it.
    push: process.env.PAYLOAD_DB_PUSH === 'true' ? true : undefined,
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: (_, siblingData: Record<string, unknown>) =>
                    siblingData.linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        AlignFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  //email: nodemailerAdapter(),
  endpoints: [],
  globals: [Header, Footer, Configuration],
  localization: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    fallback: true,
  },
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
  i18n: {
    supportedLanguages: { en, es },
    translations: {
      en: {
        custom: {
          errorIncompleteData: 'Incomplete data',
          errorUnknown: 'Unknown error',
          dealPriceNotLowerThanOriginal: 'The deal price must be lower than the original price',
          dealExpiresBeforeStarts: 'The expiration date must be after the start date',
          notLoggedIn: 'You must be logged in to perform this action',
          systemPageTitle: 'This page is managed by the platform',
          systemPageDescriptionPrefix: 'This page is auto-generated and represents the route',
          systemPageDescriptionSuffix:
            '. Its content is built by the application code and cannot be modified from this panel.',
        },
      },
      es: {
        custom: {
          errorIncompleteData: 'Datos incompletos',
          errorUnknown: 'Error desconocido',
          dealPriceNotLowerThanOriginal: 'El precio de oferta debe ser menor que el precio original',
          dealExpiresBeforeStarts: 'La fecha de vencimiento debe ser posterior a la fecha de inicio',
          notLoggedIn: 'Debes iniciar sesión para realizar esta acción',
          systemPageTitle: 'Esta página es administrada por la plataforma',
          systemPageDescriptionPrefix:
            'Esta página es generada automáticamente y representa la ruta',
          systemPageDescriptionSuffix:
            '. Su contenido es construido por el código de la aplicación y no puede ser modificado desde este panel.',
        },
      },
    },
  },
})
