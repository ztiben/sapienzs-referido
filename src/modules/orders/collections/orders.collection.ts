import { adminOnlyFieldAccess } from '@/infrastructure/access/admin-only-field.access'
import { productsModule } from '@/infrastructure/access/products-module.access'
import { features } from '@/infrastructure/features'
import { TRANSACTIONS_SLUG } from '@/shared/constants/transactions.constants'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { CollectionSlug, Field } from 'payload'

export const OrdersCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    group: {
      en: 'Products',
      es: 'Productos',
    },
    hidden: () => !features.products,
  },
  access: {
    ...defaultCollection?.access,
    create: productsModule,
    read: productsModule,
    update: productsModule,
    delete: productsModule,
  },
  fields: [
    {
      name: 'shippingCost',
      type: 'number',
      label: {
        en: 'Shipping cost',
        es: 'Costo de envío',
      },
      admin: {
        position: 'sidebar',
        placeholder: '$ 0.00',
      },
    },
    ...(defaultCollection?.fields ?? []).map((field) => {
      if ('type' in field && field.type === 'row' && 'fields' in field) {
        return {
          ...field,
          fields: field.fields.map((innerField) => {
            if ('name' in innerField && innerField.name === 'amount') {
              return {
                ...innerField,
                label: { en: 'Total (including shipping)', es: 'Total (incluyendo envío)' },
              }
            }
            return innerField
          }),
        }
      }
      if ('name' in field && field.name === 'transactions') {
        return {
          name: 'transaction',
          type: 'relationship',
          access: {
            create: adminOnlyFieldAccess,
            read: adminOnlyFieldAccess,
            update: adminOnlyFieldAccess,
          },
          admin: {
            position: 'sidebar',
          },
          unique: true,
          label: {
            en: 'Transaction',
            es: 'Transacción',
          },
          relationTo: TRANSACTIONS_SLUG as CollectionSlug,
        } as Field
      }
      return field
    }),
  ],
})
