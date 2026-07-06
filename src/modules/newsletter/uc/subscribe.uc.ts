import type { Payload } from 'payload'

import { normalizeSubscriptionEmail } from '../bl/subscription.bl'

type SubscribeInput = {
  email: string | null | undefined
  locale?: 'es' | 'en'
  source?: string
}

/**
 * Subscribes an email to the newsletter: creates the subscriber or
 * reactivates it if it had unsubscribed. Idempotent — subscribing an
 * already-subscribed email is a no-op, so the endpoint never leaks whether
 * an email already existed.
 */
export const subscribe = async (payload: Payload, input: SubscribeInput): Promise<void> => {
  const email = normalizeSubscriptionEmail(input.email)

  const existing = await payload.find({
    collection: 'subscribers',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const subscriber = existing.docs[0]

  if (!subscriber) {
    await payload.create({
      collection: 'subscribers',
      data: {
        email,
        locale: input.locale ?? 'es',
        status: 'subscribed',
        source: input.source,
      },
      overrideAccess: true,
    })
    return
  }

  if (subscriber.status !== 'subscribed') {
    await payload.update({
      collection: 'subscribers',
      id: subscriber.id,
      data: { status: 'subscribed' },
      overrideAccess: true,
    })
  }
}
