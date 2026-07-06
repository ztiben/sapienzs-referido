import type { Payload } from 'payload'

import type { Retailer } from '@/payload-types'
import { buildAffiliateUrl } from '../bl/affiliate-url.bl'

/**
 * Resolves the outbound affiliate URL for a deal and increments its click
 * counter. Returns `null` when the deal does not exist or is not published.
 *
 * The click counter update is fire-and-forget with `overrideAccess` because
 * the counter is an admin-only field updated by anonymous visitors.
 */
export const trackClickAndResolveUrl = async (
  payload: Payload,
  dealId: number,
): Promise<string | null> => {
  let deal
  try {
    deal = await payload.findByID({
      collection: 'deals',
      id: dealId,
      depth: 1,
      overrideAccess: false,
    })
  } catch {
    return null
  }

  if (!deal || deal._status !== 'published') return null

  const retailer =
    deal.retailer && typeof deal.retailer === 'object' ? (deal.retailer as Retailer) : null

  let url: string
  try {
    url = buildAffiliateUrl(deal.affiliateUrl, retailer?.affiliateTagTemplate)
  } catch {
    return null
  }

  payload
    .update({
      collection: 'deals',
      id: dealId,
      data: { clickCount: (deal.clickCount ?? 0) + 1 },
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    .catch((error) => {
      payload.logger.error(`Failed to increment clickCount for deal ${dealId}: ${error}`)
    })

  return url
}
