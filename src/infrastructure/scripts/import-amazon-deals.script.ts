import 'dotenv/config'

import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

type SourceDeal = {
  id: string
  title: string
  image_url: string
  price: number
  list_price: number
  discount_percent: number
  store_name: string
  ui_category: string
  timestamp: string
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')

// "amazon_asin_B0DZMJ9L12" -> "B0DZMJ9L12"
const extractAsin = (id: string): string => id.replace(/^amazon_asin_/, '')

const guessMime = (url: string): string => {
  const clean = url.split('?')[0].toLowerCase()
  if (clean.endsWith('.png')) return 'image/png'
  if (clean.endsWith('.webp')) return 'image/webp'
  if (clean.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

async function importAmazonDeals() {
  const { getPayload } = await import('payload')
  const configModule = await import('@payload-config')
  const payload = await getPayload({ config: configModule.default })

  // Optional CLI arg: path to a deals JSON file (defaults to the bundled data).
  const inputArg = process.argv[2]
  const jsonPath = inputArg
    ? path.resolve(process.cwd(), inputArg)
    : path.resolve(dirname, 'data/amazon-deals.json')
  payload.logger.info(`Reading deals from: ${jsonPath}`)

  const raw = readFileSync(jsonPath, 'utf-8')
  const { deals } = JSON.parse(raw) as { deals: SourceDeal[] }

  // Resolve the Amazon retailer (must be seeded first via `pnpm seed:retailers`).
  const retailerRes = await payload.find({
    collection: 'retailers',
    where: { slug: { equals: 'amazon' } },
    limit: 1,
    depth: 0,
  })
  const amazon = retailerRes.docs[0]
  if (!amazon) {
    throw new Error('Amazon retailer not found. Run `pnpm seed:retailers` first.')
  }

  const categoryCache = new Map<string, number>()

  const findOrCreateCategory = async (title: string): Promise<number> => {
    const slug = slugify(title)
    if (categoryCache.has(slug)) return categoryCache.get(slug)!

    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    let id = existing.docs[0]?.id as number | undefined
    if (!id) {
      const created = await payload.create({
        collection: 'categories',
        data: { title, slug },
        overrideAccess: true,
      })
      id = created.id as number
      payload.logger.info(`Created category: "${title}"`)
    }
    categoryCache.set(slug, id)
    return id
  }

  const uploadImage = async (url: string, alt: string, asin: string): Promise<number> => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to download image ${url} (${res.status})`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const mimetype = guessMime(url)
    const ext = mimetype.split('/')[1].replace('jpeg', 'jpg')
    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: buffer,
        mimetype,
        name: `${asin}.${ext}`,
        size: buffer.length,
      },
      overrideAccess: true,
    })
    return media.id as number
  }

  payload.logger.info(`Importing ${deals.length} Amazon deals…`)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const deal of deals) {
    try {
      const asin = extractAsin(deal.id)
      const affiliateUrl = `https://www.amazon.com/dp/${asin}`
      const featured = deal.discount_percent >= 40
      const categoryId = await findOrCreateCategory(deal.ui_category)

      // Upsert key: retailer + externalId (ASIN).
      const existing = await payload.find({
        collection: 'deals',
        where: {
          and: [
            { 'sync.externalId': { equals: asin } },
            { retailer: { equals: amazon.id } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      const baseData = {
        title: deal.title,
        retailer: amazon.id,
        category: categoryId,
        originalPrice: deal.list_price,
        dealPrice: deal.price,
        currency: 'USD' as const,
        affiliateUrl,
        featured,
        _status: 'published' as const,
        sync: {
          source: 'api' as const,
          externalId: asin,
          lastSyncedAt: deal.timestamp,
        },
      }

      if (existing.docs[0]) {
        // Update pricing/metadata; keep the already-uploaded image.
        await payload.update({
          collection: 'deals',
          id: existing.docs[0].id,
          data: baseData,
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
        updated++
        payload.logger.info(`Updated: ${asin} — ${deal.title.slice(0, 50)}`)
      } else {
        const imageId = await uploadImage(deal.image_url, deal.title, asin)
        await payload.create({
          collection: 'deals',
          data: {
            ...baseData,
            image: imageId,
            slug: `${slugify(deal.title)}-${asin.toLowerCase()}`,
          },
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
        created++
        payload.logger.info(`Created: ${asin} — ${deal.title.slice(0, 50)}`)
      }
    } catch (err) {
      skipped++
      payload.logger.error(`Skipped ${deal.id}: ${(err as Error).message}`)
    }
  }

  payload.logger.info(
    `Amazon import complete. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}.`,
  )
}

importAmazonDeals()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error importing Amazon deals:', err)
    process.exit(1)
  })
