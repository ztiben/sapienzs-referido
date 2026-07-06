/**
 * Builds the outbound affiliate URL for a deal.
 *
 * The retailer template uses `{url}` as the placeholder for the raw product
 * URL, e.g. `{url}?tag=sapyenzs-20`. When the template is missing or has no
 * placeholder, the raw URL is returned unchanged.
 *
 * Throws `Error` with `cause: 'incomplete'` when the raw URL is missing.
 */
export const buildAffiliateUrl = (
  rawUrl: string | null | undefined,
  template?: string | null,
): string => {
  if (!rawUrl) {
    throw new Error(undefined, { cause: 'incomplete' })
  }

  if (!template || !template.includes('{url}')) return rawUrl

  return template.replaceAll('{url}', rawUrl)
}
