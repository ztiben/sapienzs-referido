import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/infrastructure/access/admin-only.access'

import { subscribeEndpoint } from './endpoints/subscribe.endpoint'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: {
      en: 'Subscriber',
      es: 'Suscriptor',
    },
    plural: {
      en: 'Subscribers',
      es: 'Suscriptores',
    },
  },
  access: {
    // Public signup happens only through the custom /subscribe endpoint,
    // which uses overrideAccess — the collection itself stays admin-only.
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'locale', 'source', 'createdAt'],
    group: {
      en: 'Users',
      es: 'Usuarios',
    },
  },
  endpoints: [subscribeEndpoint],
  fields: [
    {
      name: 'email',
      label: {
        en: 'Email',
        es: 'Correo',
      },
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'locale',
      label: {
        en: 'Language',
        es: 'Idioma',
      },
      type: 'select',
      defaultValue: 'es',
      options: [
        { label: 'Español', value: 'es' },
        { label: 'English', value: 'en' },
      ],
    },
    {
      name: 'status',
      label: {
        en: 'Status',
        es: 'Estado',
      },
      type: 'select',
      defaultValue: 'subscribed',
      options: [
        { label: { en: 'Subscribed', es: 'Suscrito' }, value: 'subscribed' },
        { label: { en: 'Unsubscribed', es: 'Desuscrito' }, value: 'unsubscribed' },
      ],
    },
    {
      name: 'source',
      label: {
        en: 'Source',
        es: 'Origen',
      },
      type: 'text',
      admin: {
        description: {
          en: 'Where the signup came from (footer, home-cta, ...)',
          es: 'De dónde vino la suscripción (footer, home-cta, ...)',
        },
      },
    },
  ],
  // TODO: double opt-in (confirmation email) when the nodemailerAdapter is
  // enabled in payload.config.ts.
}
