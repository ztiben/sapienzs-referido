import type { PayloadRequest } from 'payload'

/**
 * Toggles a favorite (user, deal) pair for the authenticated user.
 * Returns the resulting state: `true` when the deal ended up favorited.
 */
export const toggleFavorite = async (
  req: PayloadRequest,
  dealId: number,
): Promise<{ favorited: boolean }> => {
  const user = req.user

  if (!user) {
    throw new Error(undefined, { cause: 'incomplete' })
  }

  const existing = await req.payload.find({
    collection: 'favorites',
    where: {
      and: [{ user: { equals: user.id } }, { deal: { equals: dealId } }],
    },
    limit: 1,
    depth: 0,
    req,
  })

  if (existing.docs.length > 0) {
    await req.payload.delete({
      collection: 'favorites',
      id: existing.docs[0].id,
      req,
    })

    return { favorited: false }
  }

  await req.payload.create({
    collection: 'favorites',
    data: {
      user: user.id,
      deal: dealId,
    },
    req,
  })

  return { favorited: true }
}
