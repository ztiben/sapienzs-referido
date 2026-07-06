import { productsModule } from '@/infrastructure/access/products-module.access'
import { features } from '@/infrastructure/features'
import { validateCartItemsBeforeChange } from '@/modules/checkout/uc/validate-cart-items.uc'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

export const CartsCollection: CollectionOverride = ({ defaultCollection }) => ({
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
  hooks: {
    ...defaultCollection?.hooks,
    beforeChange: [
      ...(defaultCollection?.hooks?.beforeChange ?? []),
      validateCartItemsBeforeChange,
    ],
  },
})
