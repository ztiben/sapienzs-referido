import { APIError, type Endpoint } from 'payload'

import { importDeals } from '../uc/import-deals.uc'

/**
 * POST /api/deals/import — pulls deals from the configured feed URL and upserts
 * them. Admin-only. Runs in a request context, so Next.js revalidation fires and
 * imported deals appear on the storefront immediately (no redeploy needed).
 */
export const importDealsEndpoint: Endpoint = {
  path: '/import',
  method: 'post',
  handler: async (req) => {
    const isAdmin = Boolean(req.user?.roles?.includes('admin'))
    if (!isAdmin) {
      throw new APIError('Only admins can import deals', 403)
    }

    const feedUrl = process.env.AMAZON_DEALS_FEED_URL
    if (!feedUrl) {
      throw new APIError('AMAZON_DEALS_FEED_URL is not configured', 500)
    }

    const summary = await importDeals(req.payload, {
      feedUrl,
      token: process.env.AMAZON_DEALS_FEED_TOKEN,
      disableRevalidate: false,
    })

    return Response.json(summary)
  },
}
