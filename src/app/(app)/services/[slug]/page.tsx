import type { Service } from '@/payload-types'

import { features } from '@/infrastructure/features'
import { currenciesConfig } from '@/infrastructure/currencies/currencies.config'
import { getPriceField } from '@/shared/bl/currency.bl'

import { ServiceDescription } from '@/modules/bookings/components/service-description/service-description.component.client'
import { ServiceGallery } from '@/modules/bookings/components/service-gallery/service-gallery.component.client'
import { RenderBlocks } from '@/modules/pages/components/render-blocks/render-blocks.component'
import { Button } from '@/shared/components/ui/button'
import { getCachedGlobal } from '@/shared/utils/get-globals.util'
import configPromise from '@payload-config'
import { ChevronLeftIcon } from 'lucide-react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

type Args = {
  params: Promise<{
    slug: string
  }>
}

const priceField = getPriceField<Service>()

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  if (!features.services) return notFound()

  const { slug } = await params
  const service = await queryServiceBySlug({ slug })

  if (!service) return notFound()

  const images = service.images?.filter((item) => typeof item === 'object') || []

  const metaImage = typeof service.meta?.image === 'object' ? service.meta?.image : undefined
  const canIndex = service._status === 'published'

  const seoImage = metaImage || (images.length ? images[0] : undefined)

  return {
    description: service.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: service.meta?.title || service.title,
  }
}

export default async function ServicePage({ params }: Args) {
  if (!features.services) return notFound()

  const { slug } = await params
  const t = await getTranslations('service')
  const [service, configuration] = await Promise.all([
    queryServiceBySlug({ slug }),
    getCachedGlobal('configuration')(),
  ])

  if (!service) return notFound()

  const whatsAppNumber = configuration?.whatsapp?.whatsAppNumber

  const images = service.images?.filter((item) => typeof item === 'object') || []

  const metaImage = typeof service.meta?.image === 'object' ? service.meta?.image : undefined

  const price = service[priceField] as number | null | undefined

  const serviceJsonLd = {
    name: service.title,
    '@context': 'https://schema.org',
    '@type': 'Service',
    description: service.meta?.description || undefined,
    image: metaImage?.url || undefined,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: price ?? undefined,
      priceCurrency: price != null ? currenciesConfig.defaultCurrency : undefined,
    },
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="container pt-8 pb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/shop?type=services">
            <ChevronLeftIcon />
            {t('backToServices')}
          </Link>
        </Button>
        <div className="flex flex-col gap-12 rounded-lg p-8 md:py-12 lg:flex-row lg:gap-8 bg-base-200">
          <div className="h-full w-full basis-full lg:basis-1/2">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-137.5 w-full overflow-hidden" />
              }
            >
              {Boolean(images?.length) && <ServiceGallery images={images} />}
            </Suspense>
          </div>

          <div className="basis-full lg:basis-1/2">
            <ServiceDescription service={service} whatsAppNumber={whatsAppNumber} />
          </div>
        </div>
      </div>

      {service.layout?.length ? <RenderBlocks blocks={service.layout} /> : <></>}
    </>
  )
}

const queryServiceBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'services',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
