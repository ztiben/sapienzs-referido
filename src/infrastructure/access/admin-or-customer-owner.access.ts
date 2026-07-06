import type { Access } from 'payload'

import { checkRole } from '@/infrastructure/access/check-role.util'

export const adminOrCustomerOwner: Access = ({ req: { user } }) => {
  if (user && checkRole(['admin'], user)) {
    return true
  }

  if (user?.id) {
    return {
      customer: {
        equals: user.id,
      },
    }
  }

  return false
}
