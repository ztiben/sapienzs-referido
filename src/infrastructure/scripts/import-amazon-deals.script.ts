import 'dotenv/config'

import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import type { SourceDeal } from '@/modules/deals/bl/map-source-deal.bl'
import { importDeals } from '@/modules/deals/uc/import-deals.uc'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * CLI wrapper around the shared import use case. Usage:
 *   pnpm import:amazon                 -> bundled data/amazon-deals.json
 *   pnpm import:amazon deals.json      -> a local JSON file
 *   pnpm import:amazon https://…/feed  -> a remote feed URL
 */
async function run() {
  const { getPayload } = await import('payload')
  const configModule = await import('@payload-config')
  const payload = await getPayload({ config: configModule.default })

  const arg = process.argv[2]
  const isUrl = arg ? /^https?:\/\//.test(arg) : false

  if (isUrl) {
    payload.logger.info(`Importing deals from feed: ${arg}`)
    await importDeals(payload, {
      feedUrl: arg,
      token: process.env.AMAZON_DEALS_FEED_TOKEN,
      disableRevalidate: true,
    })
    return
  }

  const jsonPath = arg
    ? path.resolve(process.cwd(), arg)
    : path.resolve(dirname, 'data/amazon-deals.json')
  payload.logger.info(`Importing deals from file: ${jsonPath}`)

  const raw = readFileSync(jsonPath, 'utf-8')
  const { deals } = JSON.parse(raw) as { deals: SourceDeal[] }

  await importDeals(payload, { deals, disableRevalidate: true })
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error importing deals:', err)
    process.exit(1)
  })
