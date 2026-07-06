import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook } from 'payload'
import { APIError } from 'payload'

import type { Page } from '@/payload-types'

export const preventSystemPageUpdate: CollectionBeforeChangeHook<Page> = ({
  originalDoc,
  operation,
  context,
  data,
}) => {
  if (operation === 'update' && originalDoc?.isSystemPage && !context.allowSystemPageUpdate) {
    throw new APIError('System pages cannot be updated', 403)
  }
  return data
}

export const preventSystemPageDelete: CollectionBeforeDeleteHook = async ({ req, id, context }) => {
  if (context.allowSystemPageDelete) return

  const doc = await req.payload.findByID({
    collection: 'pages',
    id,
    depth: 0,
    select: { isSystemPage: true },
    req,
  })

  if (doc?.isSystemPage) {
    throw new APIError('System pages cannot be deleted', 403)
  }
}
