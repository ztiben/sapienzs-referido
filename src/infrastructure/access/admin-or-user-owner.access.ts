import type { Access } from 'payload'

import { checkRole } from '@/infrastructure/access/check-role.util'

/**
 * Access checker for documents owned through a `user` relationship field.
 *
 * Admins have full access, authenticated users get filtered by the `user`
 * field, and unauthenticated users are denied access.
 */
export const adminOrUserOwner: Access = ({ req }) => {
  if (req.user && checkRole(['admin'], req.user)) {
    return true
  }

  if (req.user?.id) {
    return {
      user: {
        equals: req.user.id,
      },
    }
  }

  return false
}
