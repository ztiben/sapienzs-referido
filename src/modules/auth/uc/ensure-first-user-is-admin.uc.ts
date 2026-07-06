import { ensureFirstUserIsAdmin } from '@/modules/auth/bl/ensure-first-user-is-admin.bl'
import type { User } from '@/payload-types'
import { type FieldHook } from 'payload'

/**
 * Orchestrates the first-user-is-admin rule: checks via the Local API whether
 * any user exists yet, then delegates the role decision to the pure bl.
 */
export const ensureFirstUserIsAdminBeforeChange: FieldHook<User> = async ({
  operation,
  req,
  value,
}) => {
  if (operation !== 'create') return value

  const users = await req.payload.find({ collection: 'users', depth: 0, limit: 0 })

  return ensureFirstUserIsAdmin({
    operation,
    isFirstUser: users.totalDocs === 0,
    roles: value,
  })
}
