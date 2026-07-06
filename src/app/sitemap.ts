import { features } from '@/infrastructure/features'
import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const [products, services, pages] = await Promise.all([
    features.products ? payload.find({ collection: 'products', limit: 1000, depth: 0 }) : null,
    features.services ? payload.find({ collection: 'services', limit: 1000, depth: 0 }) : null,
    payload.find({
      collection: 'pages',
      limit: 1000,
      depth: 0,
      where: { _status: { equals: 'published' } },
    }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  const productRoutes: MetadataRoute.Sitemap =
    products?.docs
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      })) ?? []

  const serviceRoutes: MetadataRoute.Sitemap =
    services?.docs
      .filter((s) => s.slug)
      .map((s) => ({
        url: `${baseUrl}/services/${s.slug}`,
        lastModified: new Date(s.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })) ?? []

  const pageRoutes: MetadataRoute.Sitemap = pages.docs
    .filter((p) => p.slug && p.slug !== 'home')
    .map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  return [...staticRoutes, ...productRoutes, ...serviceRoutes, ...pageRoutes]
}
