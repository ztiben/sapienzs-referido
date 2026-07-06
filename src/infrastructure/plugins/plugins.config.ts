import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Plugin } from 'payload'

import { mercadopagoAdapter } from '@/modules/checkout/payment-methods/mercadopago/mercadopago.adapter'

import { adminOnlyFieldAccess } from '@/infrastructure/access/admin-only-field.access'
import { adminOrPublishedStatus } from '@/infrastructure/access/admin-or-published-status.access'
import { customerOnlyFieldAccess } from '@/infrastructure/access/customer-only-field.access'
import { isAdmin } from '@/infrastructure/access/is-admin.access'
import { isDocumentOwner } from '@/infrastructure/access/is-document-owner.access'
import { currenciesConfig } from '@/infrastructure/currencies/currencies.config'
import { features } from '@/infrastructure/features'
import { addressFields } from '@/infrastructure/fields/address.field'
import { OrdersCollection } from '@/modules/orders/collections/orders.collection'
import { TransactionsCollection } from '@/modules/orders/collections/transactions.collection'
import { CartsCollection } from '@/modules/products/collections/carts.collection'
import { ProductsCollection } from '@/modules/products/collections/products.collection'
import { VariantsCollection } from '@/modules/products/collections/variants.collection'
import { AddressesCollection } from '@/modules/shipping/collections/addresses/addresses.collection'
import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/shared/utils/get-url.util'
import { productsPlugin } from './products.plugin'
import { servicesPlugin } from './services.plugin'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Ecommerce Template` : 'Payload Ecommerce Template'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
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
  ecommercePlugin({
    currencies: currenciesConfig,
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    payments: {
      paymentMethods: [
        mercadopagoAdapter({
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
          webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET!,
        }),
      ],
    },
    carts: {
      cartsCollectionOverride: CartsCollection,
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      // No-op: the plugin's defaultProductsValidation does not understand
      // `infiniteInventory` and rejects products with `inventory: 0`. The real
      // validation lives in beforeChange hooks on `carts` and `transactions`
      // (see src/modules/checkout/uc/validate-cart-items.uc.ts).
      validation: () => {},
      variants: {
        variantsCollectionOverride: VariantsCollection,
      },
    },
    orders: {
      ordersCollectionOverride: OrdersCollection,
    },
    transactions: {
      transactionsCollectionOverride: TransactionsCollection,
    },
    addresses: {
      addressFields,
      addressesCollectionOverride: AddressesCollection,
    },
  }),
  ...(features.products ? [productsPlugin] : []),
  ...(features.services ? [servicesPlugin] : []),
  vercelBlobStorage({
    collections: {
      ['media']: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
    clientUploads: true,
  }),
]
