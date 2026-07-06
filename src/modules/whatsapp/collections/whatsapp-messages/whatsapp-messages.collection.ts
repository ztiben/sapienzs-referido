import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { WHATSAPP_ACCOUNTS_SLUG, WHATSAPP_MESSAGES_SLUG } from '../../constants/whatsapp.constants'

export const WhatsAppMessages: CollectionConfig = {
  slug: WHATSAPP_MESSAGES_SLUG,
  labels: {
    singular: {
      en: 'WhatsApp Message',
      es: 'Mensaje de WhatsApp',
    },
    plural: {
      en: 'WhatsApp Messages',
      es: 'Mensajes de WhatsApp',
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
    useAsTitle: 'messageId',
    defaultColumns: ['direction', 'waFrom', 'body', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'messageId',
      label: {
        en: 'Message ID',
        es: 'ID del mensaje',
      },
      type: 'text',
      required: true,
      // DB-level dedup: Meta redelivers webhooks; the unique constraint guarantees
      // a message is only ever processed once (same pattern as orders.transaction)
      unique: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'direction',
          label: {
            en: 'Direction',
            es: 'Dirección',
          },
          type: 'select',
          required: true,
          options: [
            { label: { en: 'Inbound', es: 'Entrante' }, value: 'inbound' },
            { label: { en: 'Outbound', es: 'Saliente' }, value: 'outbound' },
          ],
        },
        {
          name: 'status',
          label: {
            en: 'Status',
            es: 'Estado',
          },
          type: 'select',
          options: [
            { label: { en: 'Received', es: 'Recibido' }, value: 'received' },
            { label: { en: 'Sent', es: 'Enviado' }, value: 'sent' },
            { label: { en: 'Failed', es: 'Fallido' }, value: 'failed' },
          ],
        },
      ],
    },
    {
      name: 'account',
      label: {
        en: 'WhatsApp Account',
        es: 'Cuenta de WhatsApp',
      },
      type: 'relationship',
      relationTo: WHATSAPP_ACCOUNTS_SLUG,
      index: true,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Empty when handled with environment (test) credentials',
          es: 'Vacío cuando se atendió con credenciales de entorno (modo prueba)',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'waFrom',
          label: {
            en: 'From',
            es: 'De',
          },
          type: 'text',
          index: true,
        },
        {
          name: 'waTo',
          label: {
            en: 'To',
            es: 'Para',
          },
          type: 'text',
        },
      ],
    },
    {
      name: 'profileName',
      label: {
        en: 'Profile name',
        es: 'Nombre del perfil',
      },
      type: 'text',
    },
    {
      name: 'type',
      label: {
        en: 'Type',
        es: 'Tipo',
      },
      type: 'text',
    },
    {
      name: 'body',
      label: {
        en: 'Body',
        es: 'Contenido',
      },
      type: 'textarea',
    },
    {
      name: 'messageTimestamp',
      label: {
        en: 'Message timestamp',
        es: 'Fecha del mensaje',
      },
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
