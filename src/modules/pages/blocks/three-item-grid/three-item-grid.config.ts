import type { Block } from 'payload'

import { relationTo } from '@/modules/pages/blocks/shared/utils/relation-to.util'

export const ThreeItemGrid: Block = {
  slug: 'threeItemGrid',
  fields: [
    {
      name: 'items',
      type: 'relationship',
      admin: {
        isSortable: true,
      },
      hasMany: true,
      label: {
        en: 'Documents to show',
        es: 'Documentos a mostrar',
      },
      maxRows: 3,
      minRows: 3,
      relationTo,
    },
  ],
  interfaceName: 'ThreeItemGridBlock',
  labels: {
    plural: {
      en: 'Featured grids',
      es: 'Cuadrículas destacadas',
    },
    singular: {
      en: 'Featured grid',
      es: 'Cuadrícula destacada',
    },
  },
}
