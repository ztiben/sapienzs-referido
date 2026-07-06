import type { CollectionConfig } from 'payload'

import { adminOnlyFieldAccess } from '@/infrastructure/access/admin-only-field.access'
import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { adminOrSelf } from '@/infrastructure/access/admin-or-self.access'
import { publicAccess } from '@/infrastructure/access/public.access'

import { checkRole } from '@/infrastructure/access/check-role.util'
import { ensureFirstUserIsAdminBeforeChange } from '@/modules/auth/uc/ensure-first-user-is-admin.uc'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      en: 'User',
      es: 'Usuario',
    },
    plural: {
      en: 'Users',
      es: 'Usuarios',
    },
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    group: {
      en: 'Users',
      es: 'Usuarios',
    },
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
  },
  auth: {
    tokenExpiration: 31540000, // 1 year in seconds
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
      name: 'roles',
      type: 'select',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ['customer'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdminBeforeChange],
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: {
            en: 'Customer',
            es: 'Cliente',
          },
          value: 'customer',
        },
      ],
    },
    {
      name: 'favorites',
      label: {
        en: 'Favorites',
        es: 'Favoritos',
      },
      type: 'join',
      collection: 'favorites',
      on: 'user',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'deal', 'createdAt'],
      },
    },
  ],
}
