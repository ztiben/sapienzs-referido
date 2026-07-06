import { productsModule } from '@/infrastructure/access/products-module.access'
import { CallToAction } from '@/infrastructure/blocks/call-to-action.config'
import { Content } from '@/infrastructure/blocks/content.config'
import { MediaBlock } from '@/infrastructure/blocks/media-block.config'
import { currenciesConfig } from '@/infrastructure/currencies/currencies.config'
import { features } from '@/infrastructure/features'
import type { VariantType } from '@/payload-types'
import { generatePreviewPath } from '@/shared/utils/generate-preview-path.util'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField, type Field, type Where } from 'payload'

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  hooks: {
    ...defaultCollection.hooks,
    beforeChange: [
      ...(defaultCollection.hooks?.beforeChange ?? []),
      ({ data }) => {
        if (!data[`priceIn${currenciesConfig.defaultCurrency}Enabled`]) {
          data[`priceIn${currenciesConfig.defaultCurrency}`] = null
        }
        return data
      },
    ],
  },
  admin: {
    ...defaultCollection?.admin,
    group: {
      en: 'Products',
      es: 'Productos',
    },
    defaultColumns: ['title', 'enableVariants', '_status', 'variants.variants'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
    hidden: () => !features.products,
  },
  access: {
    ...defaultCollection?.access,
    create: productsModule,
    read: productsModule,
    update: productsModule,
    delete: productsModule,
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    inventory: true,
    infiniteInventory: true,
    meta: true,
    redirectToWhatsApp: true,
    ...{ [`priceIn${currenciesConfig.defaultCurrency}`]: true },
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
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: false,
            },
            {
              name: 'gallery',
              label: {
                en: 'Gallery',
                es: 'Galería',
              },
              type: 'array',
              minRows: 1,
              required: true,
              fields: [
                {
                  name: 'image',
                  label: {
                    en: 'Image',
                    es: 'Imagen',
                  },
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  label: {
                    en: 'Variant option',
                    es: 'Opción de variante',
                  },
                  type: 'relationship',
                  relationTo: 'variantOptions',
                  admin: {
                    condition: (data) => {
                      return data?.enableVariants === true && data?.variantTypes?.length > 0
                    },
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes.map((item: VariantType) => {
                        if (typeof item === 'object' && item?.id) {
                          return item.id
                        }
                        return item
                      })

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        }

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },
            {
              name: 'layout',
              label: {
                en: 'Layout',
                es: 'Plantilla',
              },
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
            },
          ],
          label: {
            en: 'Content',
            es: 'Contenido',
          },
        },
        {
          fields: [
            ...defaultCollection.fields.flatMap<Field>((field): Field[] => {
              if ('name' in field && field.name === 'inventory') {
                return []
              }
              if ('name' in field && field.name === 'variants') {
                const variantsAdmin = (field as { admin?: Record<string, unknown> }).admin ?? {}
                const existingColumns = Array.isArray(variantsAdmin.defaultColumns)
                  ? (variantsAdmin.defaultColumns as string[])
                  : ['title', 'options', 'inventory', 'prices', '_status']
                const inventoryIndex = existingColumns.indexOf('inventory')
                const defaultColumns =
                  inventoryIndex === -1
                    ? [...existingColumns, 'infiniteInventory']
                    : [
                        ...existingColumns.slice(0, inventoryIndex + 1),
                        'infiniteInventory',
                        ...existingColumns.slice(inventoryIndex + 1),
                      ]
                return [
                  {
                    ...field,
                    admin: {
                      ...variantsAdmin,
                      defaultColumns,
                    },
                  } as Field,
                ]
              }
              if ('name' in field && field.name === 'enableVariants') {
                const inventoryField = defaultCollection.fields.find(
                  (f) => 'name' in f && f.name === 'inventory',
                )
                return [
                  field,
                  ...(inventoryField
                    ? [
                        {
                          ...inventoryField,
                          admin: {
                            ...(inventoryField as { admin?: Record<string, unknown> }).admin,
                            condition: (data: Record<string, unknown>) =>
                              !data?.enableVariants && !data?.infiniteInventory,
                          },
                        } as Field,
                      ]
                    : []),
                  {
                    name: 'infiniteInventory',
                    label: {
                      en: 'Infinite inventory',
                      es: 'Inventario infinito',
                    },
                    type: 'checkbox',
                    defaultValue: false,
                    admin: {
                      condition: (data: Record<string, unknown>) => !data?.enableVariants,
                    },
                  },
                ]
              }
              return [field]
            }),
            {
              name: 'relatedProducts',
              label: {
                en: 'Related products',
                es: 'Productos relacionados',
              },
              type: 'relationship',
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                }
              },
              hasMany: true,
              relationTo: 'products',
            },
          ],
          label: {
            en: 'Product details',
            es: 'Detalles del producto',
          },
        },
        {
          label: {
            en: 'Customization',
            es: 'Personalización',
          },
          fields: [
            {
              name: 'redirectToWhatsApp',
              label: {
                en: 'Redirect to WhatsApp',
                es: 'Redirigir a WhatsApp',
              },
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Habilitar este campo ocasiona que, en la página de descripción del producto, se oculte el botón de añadir al carrito y se muestre un botón que redirige a WhatsApp con el número configurado en la sección de Configuración (Globales).',
              },
            },
          ],
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
    {
      name: 'categories',
      label: {
        en: 'Categories',
        es: 'Categorías',
      },
      type: 'relationship',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    slugField(),
  ],
})
