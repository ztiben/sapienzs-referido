import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: {
    plural: {
      en: 'Images and videos',
      es: 'Imágenes y videos',
    },
    singular: {
      en: 'Image or video',
      es: 'Imagen o video',
    },
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        or: [{ mimeType: { contains: 'image' } }, { mimeType: { contains: 'video' } }],
      },
    },
  ],
}
