import { currenciesConfig } from '@/infrastructure/currencies/currencies.config'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

export const VariantsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  hooks: {
    ...defaultCollection.hooks,
    beforeChange: [
      ...(defaultCollection.hooks?.beforeChange ?? []),
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
      name: 'infiniteInventory',
      label: {
        en: 'Infinite inventory',
        es: 'Inventario infinito',
      },
      type: 'checkbox',
      defaultValue: false,
    },
    ...defaultCollection.fields.map((field) => {
      if ('name' in field && field.name === 'inventory') {
        return {
          ...field,
          admin: {
            ...(field as { admin?: Record<string, unknown> }).admin,
            condition: (data: Record<string, unknown>) => !data?.infiniteInventory,
          },
        }
      }
      return field
    }),
  ],
})
