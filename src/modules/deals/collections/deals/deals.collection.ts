import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { adminOnlyFieldAccess } from '@/infrastructure/access/admin-only-field.access'
import { adminOrPublishedStatus } from '@/infrastructure/access/admin-or-published-status.access'
import { generatePreviewPath } from '@/shared/utils/generate-preview-path.util'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { favoriteEndpoint } from '../../endpoints/favorite.endpoint'
import { validateDealBeforeChange } from '../../uc/validate-deal.uc'
import { revalidateDeal, revalidateDealDelete } from './hooks/revalidate-deal'

export const Deals: CollectionConfig = {
  slug: 'deals',
  labels: {
    singular: {
      en: 'Deal',
      es: 'Oferta',
    },
    plural: {
      en: 'Deals',
      es: 'Ofertas',
    },
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'retailer', 'dealPrice', 'featured', '_status', 'updatedAt'],
    group: {
      en: 'Catalog',
      es: 'Catálogo',
    },
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'deals',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'deals',
        req,
      }),
  },
  endpoints: [favoriteEndpoint],
  fields: [
    {
      name: 'title',
      label: {
        en: 'Title',
        es: 'Título',
      },
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      label: {
        en: 'Description',
        es: 'Descripción',
      },
      type: 'richText',
      localized: true,
    },
    {
      name: 'image',
      label: {
        en: 'Image',
        es: 'Imagen',
      },
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'retailer',
      label: {
        en: 'Retailer',
        es: 'Tienda',
      },
      type: 'relationship',
      relationTo: 'retailers',
      required: true,
    },
    {
      name: 'category',
      label: {
        en: 'Category',
        es: 'Categoría',
      },
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'originalPrice',
          label: {
            en: 'Original price',
            es: 'Precio original',
          },
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'dealPrice',
          label: {
            en: 'Deal price',
            es: 'Precio de oferta',
          },
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'currency',
          label: {
            en: 'Currency',
            es: 'Moneda',
          },
          type: 'select',
          defaultValue: 'COP',
          options: [
            { label: 'COP', value: 'COP' },
            { label: 'USD', value: 'USD' },
          ],
        },
      ],
    },
    {
      name: 'affiliateUrl',
      label: {
        en: 'Product URL',
        es: 'URL del producto',
      },
      type: 'text',
      required: true,
      admin: {
        description: {
          en: 'Raw product URL. The retailer affiliate template is applied when a visitor clicks the deal.',
          es: 'URL cruda del producto. La plantilla de afiliado de la tienda se aplica cuando un visitante hace clic en la oferta.',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startsAt',
          label: {
            en: 'Starts at',
            es: 'Inicia',
          },
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'expiresAt',
          label: {
            en: 'Expires at',
            es: 'Vence',
          },
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      name: 'featured',
      label: {
        en: 'Featured',
        es: 'Destacada',
      },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'clickCount',
      label: {
        en: 'Clicks',
        es: 'Clics',
      },
      type: 'number',
      defaultValue: 0,
      access: {
        create: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'sync',
      label: {
        en: 'Synchronization',
        es: 'Sincronización',
      },
      type: 'group',
      admin: {
        position: 'sidebar',
        description: {
          en: 'Provenance of the deal. Deals imported from retailer APIs are upserted by (retailer, externalId).',
          es: 'Procedencia de la oferta. Las ofertas importadas por API se actualizan por (tienda, externalId).',
        },
      },
      fields: [
        {
          name: 'source',
          label: {
            en: 'Source',
            es: 'Origen',
          },
          type: 'select',
          defaultValue: 'manual',
          options: [
            { label: 'Manual', value: 'manual' },
            { label: 'API', value: 'api' },
          ],
          access: {
            create: adminOnlyFieldAccess,
            update: adminOnlyFieldAccess,
          },
        },
        {
          name: 'externalId',
          label: {
            en: 'External ID',
            es: 'ID externo',
          },
          type: 'text',
          index: true,
          admin: {
            condition: (_, siblingData) => siblingData?.source === 'api',
          },
        },
        {
          name: 'lastSyncedAt',
          label: {
            en: 'Last synced at',
            es: 'Última sincronización',
          },
          type: 'date',
          admin: {
            readOnly: true,
            condition: (_, siblingData) => siblingData?.source === 'api',
          },
        },
      ],
    },
    {
      name: 'meta',
      label: 'SEO',
      type: 'group',
      fields: [
        OverviewField({
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
          imagePath: 'meta.image',
        }),
        MetaTitleField({
          hasGenerateFn: true,
        }),
        MetaImageField({
          relationTo: 'media',
        }),
        MetaDescriptionField({}),
        PreviewField({
          hasGenerateFn: true,
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
        }),
      ],
    },
    slugField(),
  ],
  hooks: {
    beforeChange: [validateDealBeforeChange],
    afterChange: [revalidateDeal],
    afterDelete: [revalidateDealDelete],
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 20,
  },
}
