import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/infrastructure/access/admin-only.access'
import { adminOrPublishedStatus } from '@/infrastructure/access/admin-or-published-status.access'
import { Archive } from '@/modules/pages/blocks/archive-block/archive-block.config'
import { Banner } from '@/modules/pages/blocks/banner/banner.config'
import { CallToAction } from '@/infrastructure/blocks/call-to-action.config'
import { Carousel } from '@/modules/pages/blocks/carousel/carousel.config'
import { Content } from '@/infrastructure/blocks/content.config'
import { FormBlock } from '@/modules/pages/blocks/form/form.config'
import { hero } from '@/modules/pages/blocks/hero/hero.config'
import { InstagramFeed } from '@/modules/pages/blocks/instagram-feed/instagram-feed.config'
import { MediaBlock } from '@/infrastructure/blocks/media-block.config'
import { ThreeItemGrid } from '@/modules/pages/blocks/three-item-grid/three-item-grid.config'
import { generatePreviewPath } from '@/shared/utils/generate-preview-path.util'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'
import { preventSystemPageDelete, preventSystemPageUpdate } from './hooks/protect-system-pages'
import { revalidateDelete, revalidatePage } from './hooks/revalidate-page'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: {
      en: 'Page',
      es: 'Página',
    },
    plural: {
      en: 'Pages',
      es: 'Páginas',
    },
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: {
    group: {
      en: 'Content',
      es: 'Contenido',
    },
    defaultColumns: ['title', 'slug', 'isSystemPage', 'updatedAt'],
    components: {
      views: {
        edit: {
          default: {
            Component:
              '@/modules/pages/components/system-page-view/system-page-view.component.client#SystemPageView',
          },
        },
      },
    },
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: {
        en: 'Title',
        es: 'Título',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'publishedOn',
      label: {
        en: 'Published on',
        es: 'Publicada en',
      },
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'isSystemPage',
      label: {
        en: 'System Page',
        es: 'Página del sistema',
      },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              label: {
                en: 'Layout',
                es: 'Plantilla',
              },
              type: 'blocks',
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                Carousel,
                ThreeItemGrid,
                Banner,
                FormBlock,
                InstagramFeed,
              ],
              required: true,
            },
          ],
          label: {
            en: 'Content',
            es: 'Contenido',
          },
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
              overrides: {
                label: {
                  en: 'Title',
                  es: 'Título',
                },
              },
            }),
            MetaImageField({
              relationTo: 'media',
              overrides: {
                label: {
                  en: 'Meta Image',
                  es: 'Meta Imagen',
                },
              },
            }),
            MetaDescriptionField({
              overrides: {
                label: {
                  en: 'Description',
                  es: 'Descripción',
                },
              },
            }),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    beforeChange: [preventSystemPageUpdate],
    beforeDelete: [preventSystemPageDelete],
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
}
