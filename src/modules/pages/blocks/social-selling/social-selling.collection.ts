import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/infrastructure/access/is-admin.access'
import { publicAccess } from '@/infrastructure/access/public.access'

export const SocialSelling: CollectionConfig = {
  slug: 'social-selling',
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
  admin: {
    useAsTitle: 'platform',
    hidden: true,
  },
  access: {
    read: publicAccess,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      label: {
        en: 'Label',
        es: 'Etiqueta',
      },
      admin: {
        description: {
          en: 'Optional text shown next to the icon, e.g. "Need help? Write us"',
          es: 'Texto opcional que se muestra junto al ícono, ej. "¿Necesitas ayuda? Escríbenos"',
        },
      },
    },
    {
      name: 'platform',
      type: 'select',
      required: true,
      label: {
        en: 'Platform',
        es: 'Plataforma',
      },
      options: [
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'Facebook', value: 'facebook' },
      ],
    },
    {
      name: 'link',
      type: 'text',
      required: true,
      label: {
        en: 'Redirect link',
        es: 'Link de redirección',
      },
      admin: {
        description: {
          en: 'Full link, e.g. https://wa.me/573001234567?text=Hello',
          es: 'Link completo, ej. https://wa.me/573001234567?text=Hola',
        },
      },
    },
  ],
}
