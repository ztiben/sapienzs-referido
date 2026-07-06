import { APIError, type Endpoint } from 'payload'

import { subscribe } from '../../../uc/subscribe.uc'

/**
 * POST /api/subscribers/subscribe — public newsletter signup.
 *
 * Goes through the uc (find-or-reactivate) instead of the collection create
 * REST route so duplicate emails never surface as errors to the client.
 */
export const subscribeEndpoint: Endpoint = {
  path: '/subscribe',
  method: 'post',
  handler: async (req) => {
    const body = req.json ? await req.json() : {}
    const { email, locale, source } = body as {
      email?: string
      locale?: 'es' | 'en'
      source?: string
    }

    try {
      await subscribe(req.payload, { email, locale, source })
    } catch (error) {
      if (error instanceof Error && (error.cause === 'incomplete' || error.cause === 'invalid')) {
        throw new APIError('Invalid email address', 400)
      }
      throw error
    }

    return Response.json({ subscribed: true })
  },
}
