import type { Access } from 'payload'

import { checkRole } from '@/infrastructure/access/check-role.util'

export const adminOrPublishedStatus: Access = ({ req: { user } }) => {
  if (user && checkRole(['admin'], user)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
