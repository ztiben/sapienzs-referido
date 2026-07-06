import { APIError, type CollectionConfig } from 'payload'

import { adminOrUserOwner } from '@/infrastructure/access/admin-or-user-owner.access'

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  labels: {
    singular: {
      en: 'Favorite',
      es: 'Favorito',
    },
    plural: {
      en: 'Favorites',
      es: 'Favoritos',
    },
  },
  access: {
    // Creation is guarded by the beforeValidate hook: the user field is
    // always forced to the authenticated user.
    create: ({ req }) => Boolean(req.user),
    delete: adminOrUserOwner,
    read: adminOrUserOwner,
    update: () => false,
  },
  admin: {
    group: {
      en: 'Users',
      es: 'Usuarios',
    },
    defaultColumns: ['user', 'deal', 'createdAt'],
  },
  fields: [
    {
      name: 'user',
      label: {
        en: 'User',
        es: 'Usuario',
      },
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'deal',
      label: {
        en: 'Deal',
        es: 'Oferta',
      },
      type: 'relationship',
      relationTo: 'deals',
      required: true,
      index: true,
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation !== 'create' || !data) return data

        // Non-admins can only create favorites for themselves.
        const isAdmin = req.user?.roles?.includes('admin')
        if (!isAdmin && req.user) {
          data.user = req.user.id
        }

        if (data.user && data.deal) {
          const existing = await req.payload.find({
            collection: 'favorites',
            where: {
              and: [{ user: { equals: data.user } }, { deal: { equals: data.deal } }],
            },
            limit: 1,
            depth: 0,
            req,
          })

          if (existing.totalDocs > 0) {
            throw new APIError('Deal is already favorited by this user', 409)
          }
        }

        return data
      },
    ],
  },
}
