import type { FieldAccess } from 'payload'

import { checkRole } from '@/infrastructure/access/check-role.util'

export const customerOnlyFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (user) return checkRole(['customer'], user)

  return false
}
