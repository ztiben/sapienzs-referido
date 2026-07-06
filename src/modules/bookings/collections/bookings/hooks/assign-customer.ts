import type { Booking } from '@/payload-types'
import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'

export const assignCustomer: CollectionBeforeChangeHook<Booking> = async ({
  data,
  operation,
  req,
  context,
}) => {
  if (operation === 'create') {
    // Skip if customer was already set (e.g. by WhatsApp bot)
    if (context.skipAssignCustomer) return data

    if (!req.user) {
      // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
      throw new APIError(req.t('custom:notLoggedIn'), 401)
    }

    data.customer = req.user.id
  }

  return data
}
