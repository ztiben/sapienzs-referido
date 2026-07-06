import 'dotenv/config'

type SeedRetailerDefinition = {
  name: string
  slug: string
  websiteUrl: string
  affiliateTagTemplate: string
  defaultCurrency: 'COP' | 'USD'
}

const SEED_RETAILERS: SeedRetailerDefinition[] = [
  {
    name: 'Amazon',
    slug: 'amazon',
    websiteUrl: 'https://www.amazon.com',
    // TODO: replace with the real Amazon Associates tag.
    affiliateTagTemplate: '{url}?tag=sapyenzs-20',
    defaultCurrency: 'USD',
  },
  {
    name: 'Mercado Libre',
    slug: 'mercado-libre',
    websiteUrl: 'https://www.mercadolibre.com.co',
    // TODO: replace with the real Mercado Libre affiliate deep-link format.
    affiliateTagTemplate: '{url}',
    defaultCurrency: 'COP',
  },
  {
    name: 'Éxito',
    slug: 'exito',
    websiteUrl: 'https://www.exito.com',
    // TODO: replace with the deep-link format of the Éxito affiliate program.
    affiliateTagTemplate: '{url}',
    defaultCurrency: 'COP',
  },
]

async function seedRetailers() {
  const { getPayload } = await import('payload')
  const configModule = await import('@payload-config')
  const config = configModule.default

  const payload = await getPayload({ config })

  payload.logger.info(`Seeding retailers: ${SEED_RETAILERS.map((r) => r.slug).join(', ')}`)

  for (const retailer of SEED_RETAILERS) {
    const existing = await payload.find({
      collection: 'retailers',
      where: { slug: { equals: retailer.slug } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`Retailer "${retailer.slug}" already exists. Skipping.`)
      continue
    }

    await payload.create({
      collection: 'retailers',
      data: {
        name: retailer.name,
        slug: retailer.slug,
        websiteUrl: retailer.websiteUrl,
        affiliateTagTemplate: retailer.affiliateTagTemplate,
        defaultCurrency: retailer.defaultCurrency,
        active: true,
      },
    })

    payload.logger.info(`Created retailer: "${retailer.slug}"`)
  }

  payload.logger.info('Retailers seeding complete.')
}

seedRetailers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error seeding retailers:', err)
    process.exit(1)
  })
