import type { FieldAccess } from 'payload'

import { checkRole } from '@/infrastructure/access/check-role.util'

/**
 * Field-level access that reveals the field only to admins and the document owner.
 * Handles both populated and unpopulated relationship fields.
 */
export const isDocumentOwnerFieldAccess: FieldAccess = ({ req: { user }, doc }) => {
  if (!user) return false
  if (checkRole(['admin'], user)) return true

  const customerId = typeof doc?.customer === 'number' ? doc?.customer : doc?.customer?.id
  return user.id === customerId
}
