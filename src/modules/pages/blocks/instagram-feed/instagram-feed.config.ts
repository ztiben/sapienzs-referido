import type { Block } from 'payload'

import { relationTo } from '@/modules/pages/blocks/shared/utils/relation-to.util'

export const InstagramFeed: Block = {
  slug: 'instagramFeed',
  interfaceName: 'InstagramFeedBlock',
  labels: {
    singular: {
      en: 'Instagram Feed',
      es: 'Feed de Instagram',
    },
    plural: {
      en: 'Instagram Feeds',
      es: 'Feeds de Instagram',
    },
  },
  fields: [
    {
      name: 'posts',
      type: 'array',
      label: {
        en: 'Instagram Posts',
        es: 'Posts de Instagram',
      },
      minRows: 1,
      maxRows: 100,
      fields: [
        {
          name: 'url',
          type: 'text',
          label: {
            en: 'Instagram URL',
            es: 'URL de Instagram',
          },
          required: true,
          admin: {
            placeholder: 'https://www.instagram.com/p/ABC123/ or /reel/ABC123/',
            description: {
              en: 'Paste the full URL of an Instagram post or reel',
              es: 'Pega la URL completa de un post o reel de Instagram',
            },
          },
          validate: (value: string | null | undefined) => {
            if (!value) return 'URL is required'
            const pattern = /instagram\.com\/(p|reel)\/[\w-]+/
            if (!pattern.test(value)) {
              return 'Must be a valid Instagram post or reel URL (e.g. https://www.instagram.com/p/ABC123/)'
            }
            return true
          },
        },
        {
          name: 'handle',
          type: 'text',
          label: {
            en: '@Handle',
            es: '@Usuario',
          },
          admin: {
            placeholder: '@username',
            description: {
              en: 'Optional: Instagram handle to display on the post',
              es: 'Opcional: usuario de Instagram a mostrar sobre el post',
            },
          },
        },
        {
          name: 'linkedDoc',
          type: 'relationship',
          label: {
            en: 'Document to show',
            es: 'Documento a mostrar',
          },
          relationTo,
          required: true,
          admin: {
            description: {
              en: 'Link a deal to display below the Instagram post',
              es: 'Vincula una oferta para mostrar debajo del post de Instagram',
            },
          },
        },
      ],
    },
  ],
}
