import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Deal } from '@/payload-types'

export const revalidateDeal: CollectionAfterChangeHook<Deal> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating deal at path: /deals/${doc.slug}`)

      revalidatePath(`/deals/${doc.slug}`)
      revalidatePath('/deals')
      revalidatePath('/')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      revalidatePath(`/deals/${previousDoc.slug}`)
      revalidatePath('/deals')
      revalidatePath('/')
    }
  }
  return doc
}

export const revalidateDealDelete: CollectionAfterDeleteHook<Deal> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/deals/${doc?.slug}`)
    revalidatePath('/deals')
    revalidatePath('/')
  }

  return doc
}
