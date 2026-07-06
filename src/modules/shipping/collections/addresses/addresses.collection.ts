import { addressFields } from '@/infrastructure/fields/address.field'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { Field } from 'payload'
import { validateAddressLocationBeforeValidate } from '@/modules/shipping/uc/validate-address-location.uc'

const collectionFields: Field[] = [
  {
    name: 'customer',
    type: 'relationship',
    relationTo: 'users',
    index: true,
    admin: {
      position: 'sidebar',
    },
  },
  ...addressFields({ defaultFields: [] }),
]

export const AddressesCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: collectionFields,
  hooks: {
    ...defaultCollection.hooks,
    beforeValidate: [
      ...(defaultCollection.hooks?.beforeValidate || []),
      validateAddressLocationBeforeValidate,
    ],
  },
})
