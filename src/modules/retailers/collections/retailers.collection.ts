import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { publicAccess } from '@/infrastructure/access/public.access'

export const Retailers: CollectionConfig = {
  slug: 'retailers',
  labels: {
    singular: {
      en: 'Retailer',
      es: 'Tienda',
    },
    plural: {
      en: 'Retailers',
      es: 'Tiendas',
    },
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'websiteUrl', 'active'],
    group: {
      en: 'Catalog',
      es: 'Catálogo',
    },
  },
  fields: [
    {
      name: 'name',
      label: {
        en: 'Name',
        es: 'Nombre',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      label: {
        en: 'Logo',
        es: 'Logo',
      },
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'websiteUrl',
      label: {
        en: 'Website URL',
        es: 'URL del sitio',
      },
      type: 'text',
    },
    {
      name: 'affiliateTagTemplate',
      label: {
        en: 'Affiliate link template',
        es: 'Plantilla de enlace de afiliado',
      },
      type: 'text',
      admin: {
        description: {
          en: 'Template applied to every outbound deal link. Use {url} as the placeholder for the raw product URL, e.g. {url}?tag=sapyenzs-20. Leave empty to use the raw URL as-is.',
          es: 'Plantilla aplicada a cada enlace saliente de oferta. Usa {url} como marcador de la URL cruda del producto, ej. {url}?tag=sapyenzs-20. Déjala vacía para usar la URL tal cual.',
        },
      },
    },
    {
      name: 'defaultCurrency',
      label: {
        en: 'Default currency',
        es: 'Moneda por defecto',
      },
      type: 'select',
      defaultValue: 'COP',
      options: [
        { label: 'COP', value: 'COP' },
        { label: 'USD', value: 'USD' },
      ],
    },
    {
      name: 'active',
      label: {
        en: 'Active',
        es: 'Activa',
      },
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
