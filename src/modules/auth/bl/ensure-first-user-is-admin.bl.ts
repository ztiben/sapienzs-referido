import type { User } from '@/payload-types'

type Params = {
  operation: string
  isFirstUser: boolean
  roles: User['roles']
}

/**
 * Pure rule: the very first user created must have the `admin` role. Returns
 * the roles to persist (transformation rule, so it returns a value instead of
 * throwing). No Payload, no side effects.
 */
export const ensureFirstUserIsAdmin = ({
  operation,
  isFirstUser,
  roles,
}: Params): User['roles'] => {
  if (operation !== 'create' || !isFirstUser) return roles
  if ((roles || []).includes('admin')) return roles

  return [...(roles || []), 'admin']
}
