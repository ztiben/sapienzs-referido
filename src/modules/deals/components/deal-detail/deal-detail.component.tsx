import type { Deal, Media as MediaType, Retailer } from '@/payload-types'

import { ExternalLinkIcon } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import React from 'react'

import { computeDiscountPercent } from '@/shared/bl/discount.bl'
import type { SupportedCurrency } from '@/shared/bl/format-price.bl'
import { Media } from '@/shared/components/media/media.component'
import { Price } from '@/shared/components/price/price.component'
import { RichText } from '@/shared/components/rich-text/rich-text.component'
import { Button } from '@/shared/components/ui/button'

import { isDealExpired } from '../../bl/deal-status.bl'
import { FavoriteButton } from '../favorite-button/favorite-button.component.client'
import { ReportExpiredButton } from '../report-expired-button/report-expired-button.component.client'

type Props = {
  deal: Deal
}

const safeDiscountPercent = (deal: Deal): number | null => {
  try {
    return computeDiscountPercent(deal.originalPrice, deal.dealPrice)
  } catch {
    return null
  }
}

export const DealDetail: React.FC<Props> = async ({ deal }) => {
  const t = await getTranslations('deals')
  const format = await getFormatter()

  const image = deal.image && typeof deal.image === 'object' ? (deal.image as MediaType) : null
  const retailer =
    deal.retailer && typeof deal.retailer === 'object' ? (deal.retailer as Retailer) : null
  const currency = (deal.currency as SupportedCurrency | null | undefined) ?? undefined
  const discount = safeDiscountPercent(deal)
  const expired = isDealExpired(new Date(), deal.expiresAt)

  return (
    <div className="container grid gap-10 md:grid-cols-2">
      <div className="relative">
        {image && (
          <Media
            className="overflow-hidden rounded-2xl border bg-base-200"
            imgClassName="aspect-square h-auto w-full object-cover"
            resource={image}
          />
        )}

        {discount !== null && !expired && (
          <span className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1.5 text-sm font-bold text-destructive-foreground">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {retailer && (
          <span className="text-sm uppercase tracking-wide text-muted-foreground">
            {retailer.name}
          </span>
        )}

        <h1 className="text-3xl font-semibold md:text-4xl">{deal.title}</h1>

        <div className="flex items-baseline gap-3">
          <Price amount={deal.dealPrice} currencyCode={currency} className="text-3xl font-bold" />
          <Price
            amount={deal.originalPrice}
            currencyCode={currency}
            className="text-lg"
            strikethrough
          />
        </div>

        {expired ? (
          <p className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-medium">
            {t('expiredBadge')}
          </p>
        ) : (
          deal.expiresAt && (
            <p className="text-sm text-base-content/70">
              {t('expiresOn', {
                date: format.dateTime(new Date(deal.expiresAt), {
                  dateStyle: 'long',
                  timeStyle: 'short',
                }),
              })}
            </p>
          )
        )}

        {deal.description && (
          <RichText className="ml-0" data={deal.description} enableGutter={false} />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" disabled={expired}>
            <Link href={`/go/${deal.id}`} rel="sponsored nofollow noopener" target="_blank">
              {t('getDeal', { retailer: retailer?.name ?? '' })}
              <ExternalLinkIcon className="h-4 w-4" />
            </Link>
          </Button>

          <FavoriteButton dealId={deal.id} />
        </div>

        <div className="mt-2">
          <ReportExpiredButton dealId={deal.id} />
        </div>

        <p className="mt-6 text-xs text-base-content/50">{t('affiliateDisclosure')}</p>
      </div>
    </div>
  )
}
