import { ValidationError, type CollectionBeforeChangeHook } from 'payload'

import type { Deal } from '@/payload-types'
import { computeDiscountPercent } from '@/shared/bl/discount.bl'
import { checkDealSchedule } from '../bl/deal-status.bl'

/**
 * Orchestrates the deal validation rules: prices must produce a positive
 * discount and the availability window must be coherent. Maps each thrown
 * `cause` to a translated ValidationError because both rules guard admin
 * form fields.
 */
export const validateDealBeforeChange: CollectionBeforeChangeHook<Deal> = ({
  data,
  originalDoc,
  req,
}) => {
  const originalPrice = data.originalPrice ?? originalDoc?.originalPrice
  const dealPrice = data.dealPrice ?? originalDoc?.dealPrice
  const startsAt = data.startsAt ?? originalDoc?.startsAt
  const expiresAt = data.expiresAt ?? originalDoc?.expiresAt

  if (originalPrice != null && dealPrice != null) {
    try {
      computeDiscountPercent(originalPrice, dealPrice)
    } catch (error) {
      // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
      let message = req.t('custom:errorUnknown')

      if (error instanceof Error) {
        if (error.cause === 'incomplete') {
          // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
          message = req.t('custom:errorIncompleteData')
        } else if (error.cause === 'invalid') {
          // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
          message = req.t('custom:dealPriceNotLowerThanOriginal')
        }
      }

      throw new ValidationError({
        errors: [{ path: 'dealPrice', message }],
      })
    }
  }

  try {
    checkDealSchedule(startsAt, expiresAt)
  } catch {
    throw new ValidationError({
      errors: [
        {
          path: 'expiresAt',
          // @ts-expect-error - custom i18n keys are not in Payload's generated TFunction types
          message: req.t('custom:dealExpiresBeforeStarts'),
        },
      ],
    })
  }

  return data
}
