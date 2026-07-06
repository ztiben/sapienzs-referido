import 'dotenv/config'
import type { RequiredDataFromCollectionSlug } from 'payload'

type SeedPageDefinition = {
  title: string
  slug: string
  isSystemPage: boolean
}

const SEED_PAGES: SeedPageDefinition[] = [
  {
    title: 'Divulgación de afiliados',
    slug: 'divulgacion-afiliados',
    isSystemPage: false,
  },
  {
    title: 'Política de privacidad',
    slug: 'privacidad',
    isSystemPage: false,
  },
  {
    title: 'Acerca de',
    slug: 'acerca-de',
    isSystemPage: false,
  },
]

async function seedPages() {
  // Import getPayload and config dynamically to avoid top-level resolution issues
  const { getPayload } = await import('payload')
  const configModule = await import('@payload-config')
  const config = configModule.default

  const payload = await getPayload({ config })

  payload.logger.info(`Seeding pages: ${SEED_PAGES.map((p) => p.slug).join(', ')}`)

  for (const page of SEED_PAGES) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`Page "${page.slug}" already exists. Skipping.`)
      continue
    }

    await payload.create({
      collection: 'pages',
      draft: false,
      data: {
        title: page.title,
        slug: page.slug,
        isSystemPage: page.isSystemPage,
        _status: 'published',
        hero: {
          type: 'none',
        },
        layout: [
          {
            blockType: 'content',
            columns: [],
          },
        ],
      } as RequiredDataFromCollectionSlug<'pages'>,
      context: {
        disableRevalidate: true,
      },
    })

    payload.logger.info(`Created page: "${page.slug}" (system: ${page.isSystemPage})`)
  }

  payload.logger.info('Pages seeding complete.')
}

seedPages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error seeding pages:', err)
    process.exit(1)
  })
