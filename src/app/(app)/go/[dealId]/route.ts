import configPromise from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { trackClickAndResolveUrl } from '@/modules/deals/uc/track-click.uc'

type Args = {
  params: Promise<{
    dealId: string
  }>
}

export async function GET(_request: Request, { params }: Args) {
  const { dealId } = await params
  const id = Number(dealId)

  if (!Number.isInteger(id)) {
    notFound()
  }

  const payload = await getPayload({ config: configPromise })
  const url = await trackClickAndResolveUrl(payload, id)

  if (!url) {
    notFound()
  }

  redirect(url)
}
