import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getLocale } from 'next-intl/server'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { DealDetail } from '@/modules/deals/components/deal-detail/deal-detail.component'
import { generateMeta } from '@/shared/utils/generate-meta.util'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const deals = await payload.find({
    collection: 'deals',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return deals.docs?.map(({ slug }) => ({ slug })) ?? []
}

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function DealPage({ params }: Args) {
  const { slug } = await params

  const deal = await queryDealBySlug({ slug })

  if (!deal) {
    return notFound()
  }

  return (
    <article className="pt-16 pb-24">
      <DealDetail deal={deal} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params

  const deal = await queryDealBySlug({ slug })

  if (!deal) return {}

  return generateMeta({ doc: deal })
}

const queryDealBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })
  const locale = (await getLocale()) as 'es' | 'en'

  const result = await payload.find({
    collection: 'deals',
    depth: 1,
    draft,
    limit: 1,
    locale,
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
