import { productsModule } from '@/infrastructure/access/products-module.access'
import { features } from '@/infrastructure/features'
import { addressFields } from '@/infrastructure/fields/address.field'
import { validateCartItemsBeforeChange } from '@/modules/checkout/uc/validate-cart-items.uc'
import { TRANSACTIONS_SLUG } from '@/shared/constants/transactions.constants'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { Field } from 'payload'

// Force every required subfield in an address group to optional. Used to
// relax both `billingAddress` (defaulted by the plugin) and `shippingAddress`
// (added below) so admins can record manual ledger-only transactions —
// wire transfers, manual receipts — without filling address data.
const relaxAddressRequireds = (fields: Field[]): Field[] =>
  fields.map((field) => ('required' in field ? { ...field, required: false } : field))

const receiptField: Field = {
  name: 'receipt',
  type: 'upload',
  relationTo: 'media',
  label: {
    en: 'Receipt',
    es: 'Comprobante de Pago',
  },
  filterOptions: {
    mimeType: { contains: 'image' },
  },
}

// Subfields are forced non-required for the Transaction-level
// shippingAddress group so admins can record manual transactions (wire
// transfers, manual receipts, etc.) without filling shipping data. The
// MP-driven path still validates and populates everything before reaching
// this collection — see initiate-payment.handler.ts.
const shippingAddressField: Field = {
  name: 'shippingAddress',
  type: 'group',
  label: {
    en: 'Shipping address',
    es: 'Dirección de envío',
  },
  fields: relaxAddressRequireds(addressFields({ defaultFields: [] })),
}

// Override the `amount` label inside the sidebar row added by the plugin so
// admins see it represents the total charged including shipping — mirrors
// the same override applied on the Orders collection.
const overrideAmountLabel = (field: Field): Field => {
  if (field.type !== 'row' || !('fields' in field)) return field
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

// Walk the plugin's default tabs and: (a) prepend the receipt field to the
// first tab so admins see the upload control as the entry point of the
// form, (b) relax `billingAddress` subfields and place `shippingAddress`
// alongside it in the same tab — keeping both addresses scoped to one
// section instead of leaking outside the tabs container.
const patchDefaultTabs = (field: Field): Field => {
  if (field.type !== 'tabs' || !('tabs' in field)) return field
  return {
    ...field,
    tabs: field.tabs.map((tab, index) => {
      let containsBilling = false
      const patched = (tab.fields ?? []).map((subField) => {
        if (
          'name' in subField &&
          subField.name === 'billingAddress' &&
          subField.type === 'group' &&
          'fields' in subField
        ) {
          containsBilling = true
          return { ...subField, fields: relaxAddressRequireds(subField.fields) }
        }
        return subField
      })
      return {
        ...tab,
        fields: [
          ...(index === 0 ? [receiptField] : []),
          ...patched,
          ...(containsBilling ? [shippingAddressField] : []),
        ],
      }
    }),
  }
}

export const TransactionsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  slug: TRANSACTIONS_SLUG,
  fields: [
    ...(defaultCollection?.fields ?? []).map(patchDefaultTabs).map(overrideAmountLabel),
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
  ],
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
  hooks: {
    ...defaultCollection?.hooks,
    beforeChange: [
      ...(defaultCollection?.hooks?.beforeChange ?? []),
      validateCartItemsBeforeChange,
    ],
  },
})
