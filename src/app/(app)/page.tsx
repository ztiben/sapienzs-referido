import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getPayload } from 'payload'

import { FeaturedDeals } from '@/modules/deals/components/featured-deals/featured-deals.component'
import { RetailerSection } from '@/modules/deals/components/retailer-section/retailer-section.component'
import { NewsletterForm } from '@/modules/newsletter/components/newsletter-form/newsletter-form.component.client'
import { Button } from '@/shared/components/ui/button'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations('home')

  const retailers = await payload.find({
    collection: 'retailers',
    limit: 10,
    depth: 1,
    overrideAccess: false,
    where: { active: { equals: true } },
  })

  return (
    <div className="pb-24">
      <section className="border-b bg-base-200">
        <div className="container flex flex-col items-start gap-6 py-20 md:py-28">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="max-w-xl text-lg text-base-content/70">{t('heroSubtitle')}</p>
          <Button asChild size="lg">
            <Link href="/deals">{t('heroCta')}</Link>
          </Button>
        </div>
      </section>

      <FeaturedDeals />

      {retailers.docs.map((retailer) => (
        <RetailerSection key={retailer.id} retailer={retailer} />
      ))}

      <section className="container my-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl border bg-base-200 p-8 md:p-12">
          <h2 className="text-2xl font-semibold md:text-3xl">{t('newsletterTitle')}</h2>
          <p className="max-w-xl text-base-content/70">{t('newsletterSubtitle')}</p>
          <NewsletterForm source="home-cta" />
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('homeDescription'),
    openGraph: mergeOpenGraph({
      title: t('homeTitle'),
      url: '/',
    }),
    title: t('homeTitle'),
  }
}
