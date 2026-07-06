import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const [deals, pages] = await Promise.all([
    payload.find({
      collection: 'deals',
      limit: 1000,
      depth: 0,
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'pages',
      limit: 1000,
      depth: 0,
      where: { _status: { equals: 'published' } },
    }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  const dealRoutes: MetadataRoute.Sitemap = deals.docs
    .filter((d) => d.slug)
    .map((d) => ({
      url: `${baseUrl}/deals/${d.slug}`,
      lastModified: new Date(d.updatedAt),
      changeFrequency: 'daily',
      priority: 0.8,
    }))

  const pageRoutes: MetadataRoute.Sitemap = pages.docs
    .filter((p) => p.slug && p.slug !== 'home')
    .map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  return [...staticRoutes, ...dealRoutes, ...pageRoutes]
}
