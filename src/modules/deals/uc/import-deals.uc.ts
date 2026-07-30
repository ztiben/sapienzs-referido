import type { Payload } from 'payload'

import { guessImageMime, mapSourceDeal, type SourceDeal } from '../bl/map-source-deal.bl'

export type ImportSummary = {
  total: number
  created: number
  updated: number
  skipped: number
}

export type ImportOptions = {
  /** Remote feed URL to fetch `{ deals: [...] }` from. Ignored when `deals` is passed. */
  feedUrl?: string
  /** Optional bearer token sent as `Authorization: Bearer <token>` when fetching the feed. */
  token?: string
  /** Pre-loaded deals (e.g. from a local file); skips the HTTP fetch when provided. */
  deals?: SourceDeal[]
  /** Disable Next.js revalidation (true for CLI/no-request contexts, false inside an endpoint). */
  disableRevalidate?: boolean
}

const fetchFeed = async (feedUrl: string, token?: string): Promise<SourceDeal[]> => {
  const res = await fetch(feedUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) {
    throw new Error(`Feed request failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as { deals?: SourceDeal[] }
  if (!Array.isArray(json.deals)) {
    throw new Error('Feed response is missing a "deals" array')
  }
  return json.deals
}

/**
 * Imports deals from a feed (or a pre-loaded array) into the `deals` collection.
 * Upsert key: (retailer=amazon, sync.externalId=ASIN) — idempotent, so re-runs
 * update pricing instead of duplicating. Images are uploaded only for new deals.
 */
export const importDeals = async (
  payload: Payload,
  options: ImportOptions,
): Promise<ImportSummary> => {
  const { feedUrl, token, disableRevalidate = false } = options

  const deals = options.deals ?? (feedUrl ? await fetchFeed(feedUrl, token) : undefined)
  if (!deals) {
    throw new Error('No deals source: pass `deals` or `feedUrl`.')
  }

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

  const findOrCreateCategory = async (title: string, slug: string): Promise<number> => {
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
    }
    categoryCache.set(slug, id)
    return id
  }

  const uploadImage = async (url: string, alt: string, asin: string): Promise<number> => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to download image ${url} (${res.status})`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const mimetype = guessImageMime(url)
    const ext = mimetype.split('/')[1].replace('jpeg', 'jpg')
    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data: buffer, mimetype, name: `${asin}.${ext}`, size: buffer.length },
      overrideAccess: true,
    })
    return media.id as number
  }

  const summary: ImportSummary = { total: deals.length, created: 0, updated: 0, skipped: 0 }

  for (const source of deals) {
    try {
      const mapped = mapSourceDeal(source)
      const categoryId = await findOrCreateCategory(mapped.categoryTitle, mapped.categorySlug)

      const existing = await payload.find({
        collection: 'deals',
        where: {
          and: [
            { 'sync.externalId': { equals: mapped.asin } },
            { retailer: { equals: amazon.id } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      const baseData = {
        title: mapped.title,
        retailer: amazon.id,
        category: categoryId,
        originalPrice: mapped.originalPrice,
        dealPrice: mapped.dealPrice,
        currency: 'USD' as const,
        affiliateUrl: mapped.affiliateUrl,
        featured: mapped.featured,
        _status: 'published' as const,
        sync: {
          source: 'api' as const,
          externalId: mapped.asin,
          lastSyncedAt: mapped.lastSyncedAt,
        },
      }

      if (existing.docs[0]) {
        await payload.update({
          collection: 'deals',
          id: existing.docs[0].id,
          data: baseData,
          overrideAccess: true,
          context: { disableRevalidate },
        })
        summary.updated++
      } else {
        const imageId = await uploadImage(mapped.imageUrl, mapped.title, mapped.asin)
        await payload.create({
          collection: 'deals',
          data: { ...baseData, image: imageId, slug: mapped.slug },
          overrideAccess: true,
          context: { disableRevalidate },
        })
        summary.created++
      }
    } catch (err) {
      summary.skipped++
      payload.logger.error(`Skipped ${source.id}: ${(err as Error).message}`)
    }
  }

  payload.logger.info(
    `Deals import complete. Created: ${summary.created}, Updated: ${summary.updated}, Skipped: ${summary.skipped}.`,
  )
  return summary
}
