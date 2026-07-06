import type { Access } from 'payload'

import { checkRole } from '@/infrastructure/access/check-role.util'

export const adminOnly: Access = ({ req: { user } }) => {
  if (user) return checkRole(['admin'], user)

  return false
}
