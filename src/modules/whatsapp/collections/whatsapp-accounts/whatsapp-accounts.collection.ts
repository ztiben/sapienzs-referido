import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { WHATSAPP_ACCOUNTS_SLUG } from '../../constants/whatsapp.constants'
import { decryptAccessToken } from './hooks/decrypt-access-token'
import { encryptAccessToken } from './hooks/encrypt-access-token'

export const WhatsAppAccounts: CollectionConfig = {
  slug: WHATSAPP_ACCOUNTS_SLUG,
  labels: {
    singular: {
      en: 'WhatsApp Account',
      es: 'Cuenta de WhatsApp',
    },
    plural: {
      en: 'WhatsApp Accounts',
      es: 'Cuentas de WhatsApp',
    },
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: {
      en: 'WhatsApp',
      es: 'WhatsApp',
    },
    useAsTitle: 'name',
    defaultColumns: ['name', 'displayPhoneNumber', 'phoneNumberId', 'status'],
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
      type: 'row',
      fields: [
        {
          name: 'phoneNumberId',
          label: {
            en: 'Phone Number ID',
            es: 'ID del número de teléfono',
          },
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: {
              en: 'Meta "Phone number ID" of the sending number (not the phone number itself)',
              es: 'El "Phone number ID" de Meta del número emisor (no el número de teléfono)',
            },
          },
        },
        {
          name: 'wabaId',
          label: {
            en: 'WhatsApp Business Account ID (WABA)',
            es: 'ID de la cuenta de WhatsApp Business (WABA)',
          },
          type: 'text',
        },
      ],
    },
    {
      name: 'displayPhoneNumber',
      label: {
        en: 'Display phone number',
        es: 'Número de teléfono visible',
      },
      type: 'text',
    },
    {
      name: 'accessToken',
      label: {
        en: 'Access token',
        es: 'Token de acceso',
      },
      type: 'text',
      required: true,
      access: {
        // Never exposed through the API (not even to admins); the webhook reads it
        // via the Local API with overrideAccess: true. Encrypted at rest.
        read: () => false,
      },
      hooks: {
        beforeChange: [encryptAccessToken],
        afterRead: [decryptAccessToken],
      },
      admin: {
        description: {
          en: 'Write-only: it is stored encrypted and never displayed back. Leave empty to keep the current token.',
          es: 'Solo escritura: se guarda cifrado y nunca se vuelve a mostrar. Déjalo vacío para conservar el token actual.',
        },
      },
    },
    {
      name: 'status',
      label: {
        en: 'Status',
        es: 'Estado',
      },
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: { en: 'Active', es: 'Activa' },
          value: 'active',
        },
        {
          label: { en: 'Disabled', es: 'Deshabilitada' },
          value: 'disabled',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
