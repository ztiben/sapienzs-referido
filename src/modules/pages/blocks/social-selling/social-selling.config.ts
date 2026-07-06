import type { Block } from 'payload'

export const SocialSellingBlock: Block = {
  slug: 'socialSelling',
  interfaceName: 'SocialSellingBlock',
  labels: {
    singular: {
      en: 'Social Selling',
      es: 'Social Selling',
    },
    plural: {
      en: 'Social Selling',
      es: 'Social Selling',
    },
  },
  fields: [
    {
      name: 'links',
      type: 'relationship',
      relationTo: 'social-selling',
      hasMany: true,
      required: true,
      label: {
        en: 'Social networks to display',
        es: 'Redes sociales a mostrar',
      },
    },
  ],
}
