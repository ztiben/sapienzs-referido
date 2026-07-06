import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { adminOrPublishedStatus } from '@/infrastructure/access/admin-or-published-status.access'
import {
    DEFAULT_BUFFER_MINUTES,
    MAX_DURATION_MINUTES,
} from '@/modules/bookings/constants/services.constants'
import { serviceModalities } from '@/modules/bookings/fields/service-modalities.field'
import { CallToAction } from '@/infrastructure/blocks/call-to-action.config'
import { Content } from '@/infrastructure/blocks/content.config'
import { MediaBlock } from '@/infrastructure/blocks/media-block.config'
import { currenciesConfig } from '@/infrastructure/currencies/currencies.config'
import { generatePreviewPath } from '@/shared/utils/generate-preview-path.util'
import { pricesField } from '@payloadcms/plugin-ecommerce'
import {
    MetaDescriptionField,
    MetaImageField,
    MetaTitleField,
    OverviewField,
    PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
    FixedToolbarFeature,
    HeadingFeature,
    HorizontalRuleFeature,
    InlineToolbarFeature,
    lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: {
      en: 'Service',
      es: 'Servicio',
    },
    plural: {
      en: 'Services',
      es: 'Servicios',
    },
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: {
    group: {
      en: 'Services',
      es: 'Servicios',
    },
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      `priceIn${currenciesConfig.defaultCurrency}`,
      'durationMinutes',
      '_status',
    ],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'services',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'services',
        req,
      }),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data[`priceIn${currenciesConfig.defaultCurrency}Enabled`]) {
          data[`priceIn${currenciesConfig.defaultCurrency}`] = null
        }
        return data
      },
    ],
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
      index: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Details',
            es: 'Detalles',
          },
          fields: [
            serviceModalities(),
            {
              type: 'group',
              label: {
                en: 'Time',
                es: 'Tiempo',
              },
              fields: [
                {
                  name: 'durationMinutes',
                  label: {
                    en: 'Duration in minutes',
                    es: 'Duración en minutos',
                  },
                  type: 'number',
                  required: true,
                  min: 15,
                  max: MAX_DURATION_MINUTES,
                  validate: (value: number | null | undefined) =>
                    !value || value % 5 === 0 || 'Duration must be a multiple of 5 minutes',
                },
                {
                  name: 'bufferMinutes',
                  label: {
                    en: 'Minutes to block between bookings',
                    es: 'Minutos para bloquear entre reservas',
                  },
                  type: 'number',
                  defaultValue: DEFAULT_BUFFER_MINUTES,
                  min: 0,
                  max: 480,
                  validate: (value: number | null | undefined) =>
                    value == null || value % 5 === 0 || 'Buffer must be a multiple of 5 minutes',
                },
              ],
            },
            ...pricesField({ currenciesConfig }),
          ],
        },
        {
          label: {
            en: 'Assignments',
            es: 'Asignaciones',
          },
          fields: [
            {
              name: 'stores',
              label: {
                en: 'Stores',
                es: 'Tiendas',
              },
              type: 'join',
              collection: 'stores',
              on: 'services',
              admin: {
                hidden: true,
              },
            },
            {
              name: 'staff',
              label: {
                en: 'Staff',
                es: 'Trabajadores',
              },
              type: 'join',
              collection: 'staff',
              on: 'services',
              admin: {
                hidden: true,
              },
            },
            {
              name: 'bookings',
              label: {
                en: 'Bookings',
                es: 'Reservas',
              },
              type: 'join',
              collection: 'bookings',
              on: 'service',
              admin: {
                allowCreate: false,
              },
            },
          ],
        },
        {
          label: {
            en: 'Content',
            es: 'Contenido',
          },
          fields: [
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: false,
            },
            {
              name: 'images',
              label: {
                en: 'Images',
                es: 'Imágenes',
              },
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              required: true,
              minRows: 1,
            },
            {
              name: 'layout',
              label: {
                en: 'Layout',
                es: 'Plantilla',
              },
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
            },
          ],
        },
        {
          label: {
            en: 'Customization',
            es: 'Personalización',
          },
          fields: [
            {
              name: 'redirectToWhatsApp',
              label: {
                en: 'Redirect to WhatsApp',
                es: 'Redirigir a WhatsApp',
              },
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Habilitar este campo ocasiona que, en la página de descripción del servicio, se oculte el formulario de reserva y se muestre un botón que redirige a WhatsApp con el número configurado en la sección de Configuración (Globales).',
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
              overrides: {
                label: {
                  en: 'Title',
                  es: 'Título',
                },
              },
            }),
            MetaImageField({
              relationTo: 'media',
              overrides: {
                label: {
                  en: 'Meta Image',
                  es: 'Meta Imagen',
                },
              },
            }),
            MetaDescriptionField({
              overrides: {
                label: {
                  en: 'Description',
                  es: 'Descripción',
                },
              },
            }),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'categories',
      label: {
        en: 'Categories',
        es: 'Categorías',
      },
      type: 'relationship',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    slugField(),
  ],
  versions: {
    drafts: true,
  },
}
