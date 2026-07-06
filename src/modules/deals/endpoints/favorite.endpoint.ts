import { APIError, type Endpoint } from 'payload'

import { toggleFavorite } from '../uc/toggle-favorite.uc'

/**
 * POST /api/deals/:id/favorite — toggles the deal as favorite for the
 * authenticated user.
 */
export const favoriteEndpoint: Endpoint = {
  path: '/:id/favorite',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
      throw new APIError(req.t('custom:notLoggedIn'), 401)
    }

    const dealId = Number(req.routeParams?.id)

    if (!Number.isInteger(dealId)) {
      throw new APIError('Invalid deal id', 400)
    }

    const result = await toggleFavorite(req, dealId)

    return Response.json(result)
  },
}
