/**
 * Computes the discount percentage of a deal, rounded to the nearest integer.
 *
 * Throws `Error` with `cause: 'incomplete'` when any price is missing, and
 * `cause: 'invalid'` when the deal price is not lower than the original price.
 */
export const computeDiscountPercent = (
  originalPrice: number | null | undefined,
  dealPrice: number | null | undefined,
): number => {
  if (
    originalPrice === null ||
    originalPrice === undefined ||
    dealPrice === null ||
    dealPrice === undefined
  ) {
    throw new Error(undefined, { cause: 'incomplete' })
  }

  if (originalPrice <= 0 || dealPrice < 0 || dealPrice >= originalPrice) {
    throw new Error(undefined, { cause: 'invalid' })
  }

  return Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
}
