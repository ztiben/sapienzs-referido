// import type { Payload } from 'payload'

// /** Normalize phone: strip +, spaces, dashes → digits only */
// export function normalizePhone(phone: string): string {
//   return phone.replace(/[^0-9]/g, '')
// }

// export async function findUserByPhone(payload: Payload, phone: string): Promise<number | null> {
//   const normalized = normalizePhone(phone)

//   const { docs } = await payload.find({
//     collection: 'users',
//     where: { phone: { equals: normalized } },
//     limit: 10,
//     depth: 0,
//     overrideAccess: true,
//   })

//   if (docs.length === 0) return null

//   // Prefer real users (non-placeholder) over placeholder accounts
//   const realUser = docs.find((u) => !u.email?.endsWith('@whatsapp.placeholder'))
//   return realUser ? realUser.id : docs[0].id
// }

// /** Generates a random 8-char temporary password */
// export function generateTempPassword(): string {
//   const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
//   let pass = ''
//   for (let i = 0; i < 8; i++) {
//     pass += chars[Math.floor(Math.random() * chars.length)]
//   }
//   return pass
// }
