// import { localToUTCString } from '@/modules/bookings/domain/bookings/timezone'
// import { findUserByPhone, generateTempPassword, normalizePhone } from '@/modules/whatsapp/services/helpers'
// import type { Booking } from '@/payload-types'
// import type { Payload, Where } from 'payload'
// import { getAvailableDates, getAvailableSlots } from './availability'
// import { sendButtonMessage, sendListMessage, sendTextMessage } from './client'
// import {
//   formatDateFromCode,
//   formatDateShort,
//   formatDatetimeUTC,
//   formatDuration,
//   formatPrice,
//   formatTime,
// } from './format'
// import { MODALITY_LABEL, MODALITY_SHORT, SHORT_TO_MODALITY } from './types'

// // --- Welcome: entry point with 2 buttons ---

// export async function showWelcome(
//   payload: Payload,
//   to: string,
//   contactName?: string,
// ): Promise<void> {
//   let name = contactName
//   if (!name) {
//     const userId = await findUserByPhone(payload, to)
//     if (userId) {
//       const user = await payload.findByID({
//         collection: 'users',
//         id: userId,
//         depth: 0,
//         overrideAccess: true,
//       })
//       if (user.name && !user.name.startsWith('WhatsApp ')) {
//         name = user.name
//       }
//     }
//   }

//   const greeting = name
//     ? `¡Hola ${name}! 👋 ¿En qué te podemos ayudar?`
//     : '¡Hola! 👋 ¿En qué te podemos ayudar?'

//   await sendButtonMessage(to, greeting, [
//     { id: 'menu_catalog', title: 'Ver servicios' },
//     { id: 'menu_bookings', title: 'Mis citas' },
//   ])
// }

// // --- Catalog: show all services with details ---

// export async function showCatalog(payload: Payload, to: string): Promise<void> {
//   const { docs: services } = await payload.find({
//     collection: 'services',
//     limit: 20,
//     sort: 'title',
//     depth: 1,
//     overrideAccess: true,
//   })

//   if (services.length === 0) {
//     await sendTextMessage(to, 'No hay servicios disponibles en este momento.')
//     await showWelcome(payload, to)
//     return
//   }

//   const lines = services.map((s) => {
//     const price = formatPrice(s.priceInCOP)
//     const duration = formatDuration(s.durationMinutes)
//     const locations: string[] = []
//     if (s.modalities?.includes('inStore')) {
//       const storeNames = (s.stores as { docs?: { name: string }[] })?.docs?.map((st) => st.name)
//       if (storeNames?.length) {
//         locations.push(...storeNames)
//       } else {
//         locations.push('En tienda')
//       }
//     }
//     if (s.modalities?.includes('delivery')) locations.push('A domicilio')
//     return `✂️ *${s.title}*\n💰 ${price} · ⏱️ ${duration}\n📍 ${locations.join(' · ')}`
//   })

//   const catalog = ['📋 *Nuestros Servicios*', '', ...lines.join('\n\n').split('\n')].join('\n')

//   await sendTextMessage(to, catalog)

//   await sendButtonMessage(to, '¿Te gustaría agendar una cita?', [
//     { id: 'book_start', title: 'Agendar cita' },
//     { id: 'cancel', title: 'Volver al menú' },
//   ])
// }

// // --- Registration helper: returns userId if fully registered, null if pending ---

// async function ensureRegistered(
//   payload: Payload,
//   to: string,
//   contactName?: string,
// ): Promise<number | null> {
//   const normalized = normalizePhone(to)
//   let userId = await findUserByPhone(payload, to)

//   // Also check by placeholder email in case phone wasn't saved properly before
//   if (!userId) {
//     const { docs } = await payload.find({
//       collection: 'users',
//       where: { email: { equals: `wa_${normalized}@whatsapp.placeholder` } },
//       limit: 1,
//       depth: 0,
//       overrideAccess: true,
//     })
//     if (docs.length > 0) {
//       await payload.update({
//         collection: 'users',
//         id: docs[0].id,
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         data: { phone: normalized, name: contactName || docs[0].name || undefined } as any,
//         overrideAccess: true,
//       })
//       userId = docs[0].id
//     }
//   }

//   if (userId) {
//     const user = await payload.findByID({ collection: 'users', id: userId, depth: 0, overrideAccess: true })

//     if (!user.email?.endsWith('@whatsapp.placeholder')) {
//       return userId // Fully registered
//     }

//     // Has placeholder email → ask for real email
//     await sendTextMessage(
//       to,
//       'Necesitamos completar tu registro.\n\n📧 Por favor escribe tu *correo electrónico*:',
//     )
//     return null
//   }

//   // Create new placeholder user
//   await payload.create({
//     collection: 'users',
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     data: {
//       name: contactName || undefined,
//       email: `wa_${normalized}@whatsapp.placeholder`,
//       password: generateTempPassword(),
//       phone: normalized,
//       roles: ['customer'],
//     } as any,
//     overrideAccess: true,
//   })

//   await sendTextMessage(
//     to,
//     'Para continuar necesitamos registrarte.\n\n📧 Por favor escribe tu *correo electrónico*:',
//   )
//   return null
// }

// // --- Start booking: check registration first ---

// export async function startBookingFlow(payload: Payload, to: string, contactName?: string): Promise<void> {
//   const userId = await ensureRegistered(payload, to, contactName)
//   if (!userId) return
//   await showServices(payload, to)
// }

// // --- Registration: process email, complete registration, continue to services ---

// export async function processEmail(payload: Payload, to: string, text: string | null, contactName?: string): Promise<void> {
//   const email = text?.trim().toLowerCase() ?? ''

//   if (!email || !email.includes('@') || !email.includes('.')) {
//     await sendTextMessage(
//       to,
//       '❌ El correo no parece válido. Por favor escribe un correo electrónico correcto:',
//     )
//     return
//   }

//   // Check if email is already used by another account
//   const { docs } = await payload.find({
//     collection: 'users',
//     where: { email: { equals: email } },
//     limit: 1,
//     depth: 0,
//     overrideAccess: true,
//   })

//   if (docs.length > 0) {
//     await sendTextMessage(
//       to,
//       '❌ Este correo ya está registrado. Por favor escribe otro correo:',
//     )
//     return
//   }

//   const userId = await findUserByPhone(payload, to)
//   if (!userId) {
//     await showWelcome(payload, to)
//     return
//   }

//   const tempPassword = generateTempPassword()

//   try {
//     // Update email, set name from WhatsApp contact, generate temp password
//     await payload.update({
//       collection: 'users',
//       id: userId,
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       data: {
//         email,
//         name: contactName || undefined,
//         password: tempPassword,
//       } as any,
//       overrideAccess: true,
//     })

//     const displayName = contactName || 'Usuario'

//     await sendTextMessage(
//       to,
//       [
//         '✅ *¡Cuenta creada exitosamente!*',
//         '',
//         `👤 *Nombre:* ${displayName}`,
//         `📧 *Correo:* ${email}`,
//         `🔑 *Contraseña temporal:* \`${tempPassword}\``,
//         '',
//         '_Puedes cambiarla desde nuestra web._',
//       ].join('\n'),
//     )

//     await showWelcome(payload, to, contactName)
//   } catch (error) {
//     console.error('[WhatsApp Bot] Error completing registration:', error)
//     await sendTextMessage(to, 'Hubo un error al crear tu cuenta. Por favor intenta de nuevo.')
//     await showWelcome(payload, to)
//   }
// }

// // --- Step 1: Show services ---

// export async function showServices(payload: Payload, to: string): Promise<void> {
//   const { docs: services } = await payload.find({
//     collection: 'services',
//     limit: 9,
//     sort: 'title',
//     depth: 0,
//     overrideAccess: true,
//   })

//   if (services.length === 0) {
//     await sendTextMessage(to, 'No hay servicios disponibles en este momento.')
//     await showWelcome(payload, to)
//     return
//   }

//   if (services.length <= 2) {
//     await sendButtonMessage(to, 'Elige un servicio para agendar tu cita:', [
//       ...services.map((s) => ({
//         id: `svc_${s.id}`,
//         title: s.title.slice(0, 20),
//       })),
//       { id: 'cancel', title: 'Volver al menú' },
//     ])
//   } else {
//     await sendListMessage(to, 'Elige un servicio para agendar tu cita:', 'Elegir servicio', [
//       {
//         title: 'Servicios',
//         rows: [
//           ...services.map((s) => ({
//             id: `svc_${s.id}`,
//             title: s.title.slice(0, 24),
//             description: formatPrice(s.priceInCOP),
//           })),
//           { id: 'cancel', title: 'Volver al menú' },
//         ],
//       },
//     ])
//   }
// }

// // --- Step 2: Show modalities ---

// export async function showModalities(
//   payload: Payload,
//   to: string,
//   serviceId: number,
// ): Promise<void> {
//   const service = await payload.findByID({ collection: 'services', id: serviceId, depth: 0, overrideAccess: true })

//   const available = service.modalities ?? []

//   if (available.length === 0) {
//     await sendTextMessage(to, 'Este servicio no tiene modalidades disponibles.')
//     await showWelcome(payload, to)
//     return
//   }

//   // Auto-skip if only one modality
//   if (available.length === 1) {
//     const mod = available[0]
//     if (mod === 'inStore') {
//       await showStores(payload, to, serviceId)
//     } else {
//       await showStaff(payload, to, serviceId, MODALITY_SHORT[mod], null)
//     }
//     return
//   }

//   const modButtons = available.map((mod) => ({
//     id: `mod_${serviceId}_${MODALITY_SHORT[mod]}`,
//     title: MODALITY_LABEL[mod].slice(0, 20),
//   }))
//   if (modButtons.length < 3) {
//     modButtons.push({ id: 'cancel', title: 'Volver al menú' })
//   }

//   await sendButtonMessage(
//     to,
//     `*${service.title}*\n${formatPrice(service.priceInCOP)} · ${formatDuration(service.durationMinutes)}\n\n¿Cómo prefieres tomarlo?`,
//     modButtons,
//   )
// }

// // --- Step 3: Show stores ---

// export async function showStores(payload: Payload, to: string, serviceId: number): Promise<void> {
//   const { docs: stores } = await payload.find({
//     collection: 'stores',
//     where: { services: { in: [serviceId] } },
//     limit: 9,
//     depth: 0,
//     overrideAccess: true,
//   })

//   if (stores.length === 0) {
//     await sendTextMessage(to, 'No hay tiendas disponibles para este servicio.')
//     await showWelcome(payload, to)
//     return
//   }

//   // Auto-skip if only one store
//   if (stores.length === 1) {
//     await showStaff(payload, to, serviceId, MODALITY_SHORT.inStore, stores[0].id)
//     return
//   }

//   if (stores.length <= 2) {
//     await sendButtonMessage(to, 'Elige una tienda:', [
//       ...stores.map((s) => ({
//         id: `str_${serviceId}_${s.id}`,
//         title: s.name.slice(0, 20),
//       })),
//       { id: 'cancel', title: 'Volver al menú' },
//     ])
//   } else {
//     await sendListMessage(to, 'Elige una tienda:', 'Ver tiendas', [
//       {
//         title: 'Tiendas',
//         rows: [
//           ...stores.map((s) => ({
//             id: `str_${serviceId}_${s.id}`,
//             title: s.name.slice(0, 24),
//           })),
//           { id: 'cancel', title: 'Volver al menú' },
//         ],
//       },
//     ])
//   }
// }

// // --- Step 4: Show staff ---

// export async function showStaff(
//   payload: Payload,
//   to: string,
//   serviceId: number,
//   modShort: string,
//   storeId: number | null,
// ): Promise<void> {
//   const modality = SHORT_TO_MODALITY[modShort]
//   const conditions: Where[] = [{ services: { in: [serviceId] } }]

//   if (modality === 'inStore' && storeId) {
//     conditions.push({ stores: { in: [storeId] } })
//   }
//   if (modality === 'delivery') {
//     conditions.push({ offersDelivery: { equals: true } })
//   }

//   const { docs: staffList } = await payload.find({
//     collection: 'staff',
//     where: { and: conditions },
//     limit: 9,
//     depth: 0,
//     overrideAccess: true,
//   })

//   if (staffList.length === 0) {
//     await sendTextMessage(to, 'No hay profesionales disponibles para este servicio.')
//     await showWelcome(payload, to)
//     return
//   }

//   const storeIdStr = storeId != null ? String(storeId) : '0'

//   // Auto-skip if only one staff member
//   if (staffList.length === 1) {
//     await showDates(payload, to, serviceId, modShort, storeIdStr, staffList[0].id)
//     return
//   }

//   if (staffList.length <= 2) {
//     await sendButtonMessage(to, 'Elige un profesional:', [
//       ...staffList.map((s) => ({
//         id: `stf_${serviceId}_${modShort}_${storeIdStr}_${s.id}`,
//         title: s.name.slice(0, 20),
//       })),
//       { id: 'cancel', title: 'Volver al menú' },
//     ])
//   } else {
//     await sendListMessage(to, 'Elige un profesional:', 'Ver profesionales', [
//       {
//         title: 'Profesionales',
//         rows: [
//           ...staffList.map((s) => ({
//             id: `stf_${serviceId}_${modShort}_${storeIdStr}_${s.id}`,
//             title: s.name.slice(0, 24),
//           })),
//           { id: 'cancel', title: 'Volver al menú' },
//         ],
//       },
//     ])
//   }
// }

// // --- Step 5: Show dates ---

// export async function showDates(
//   payload: Payload,
//   to: string,
//   serviceId: number,
//   modShort: string,
//   storeIdStr: string,
//   staffId: number,
// ): Promise<void> {
//   const [staff, service] = await Promise.all([
//     payload.findByID({ collection: 'staff', id: staffId, depth: 0, overrideAccess: true }),
//     payload.findByID({ collection: 'services', id: serviceId, depth: 0, overrideAccess: true }),
//   ])

//   const dates = getAvailableDates(staff, service, 9)

//   if (dates.length === 0) {
//     await sendTextMessage(to, 'No hay fechas disponibles próximamente.')
//     await showWelcome(payload, to)
//     return
//   }

//   await sendListMessage(to, `*${staff.name}*\nElige una fecha:`, 'Ver fechas', [
//     {
//       title: 'Fechas disponibles',
//       rows: [
//         ...dates.map((d) => ({
//           id: `date_${serviceId}_${modShort}_${storeIdStr}_${staffId}_${d.code}`,
//           title: formatDateShort(d.date).slice(0, 24),
//         })),
//         { id: 'cancel', title: 'Volver al menú' },
//       ],
//     },
//   ])
// }

// // --- Step 6: Show time slots ---

// export async function showTimeSlots(
//   payload: Payload,
//   to: string,
//   serviceId: number,
//   modShort: string,
//   storeIdStr: string,
//   staffId: number,
//   dateCode: string,
// ): Promise<void> {
//   const [staff, service] = await Promise.all([
//     payload.findByID({ collection: 'staff', id: staffId, depth: 0, overrideAccess: true }),
//     payload.findByID({ collection: 'services', id: serviceId, depth: 0, overrideAccess: true }),
//   ])

//   const slots = await getAvailableSlots(payload, staffId, staff, service, dateCode)

//   if (slots.length === 0) {
//     await sendTextMessage(
//       to,
//       `No hay horarios disponibles para ${formatDateFromCode(dateCode)}. Intenta otra fecha.`,
//     )
//     await showWelcome(payload, to)
//     return
//   }

//   // WhatsApp list max 10 rows (reserve 1 for "Volver")
//   const displaySlots = slots.slice(0, 9)

//   await sendListMessage(
//     to,
//     `*${formatDateFromCode(dateCode)}*\nElige un horario:`,
//     'Ver horarios',
//     [
//       {
//         title: 'Horarios disponibles',
//         rows: [
//           ...displaySlots.map((s) => ({
//             id: `time_${serviceId}_${modShort}_${storeIdStr}_${staffId}_${dateCode}_${s.code}`,
//             title: formatTime(s.code).slice(0, 24),
//           })),
//           { id: 'cancel', title: 'Volver al menú' },
//         ],
//       },
//     ],
//   )
// }

// // --- Step 7: Show confirmation ---

// export async function showConfirmation(
//   payload: Payload,
//   to: string,
//   serviceId: number,
//   modShort: string,
//   storeIdStr: string,
//   staffId: number,
//   dateCode: string,
//   timeCode: string,
// ): Promise<void> {
//   const [service, staff] = await Promise.all([
//     payload.findByID({ collection: 'services', id: serviceId, depth: 0, overrideAccess: true }),
//     payload.findByID({ collection: 'staff', id: staffId, depth: 0, overrideAccess: true }),
//   ])

//   const modality = SHORT_TO_MODALITY[modShort]
//   let locationLine = `📍 ${MODALITY_LABEL[modality]}`
//   if (modality === 'inStore' && storeIdStr !== '0') {
//     const store = await payload.findByID({
//       collection: 'stores',
//       id: parseInt(storeIdStr),
//       depth: 0,
//       overrideAccess: true,
//     })
//     locationLine = `📍 ${store.name}`
//   }

//   const summary = [
//     '📋 *Resumen de tu cita*',
//     '',
//     `✂️ *Servicio:* ${service.title}`,
//     `👤 *Profesional:* ${staff.name}`,
//     locationLine,
//     `📅 *Fecha:* ${formatDateFromCode(dateCode)}`,
//     `🕐 *Hora:* ${formatTime(timeCode)}`,
//     `⏱️ *Duración:* ${formatDuration(service.durationMinutes)}`,
//     `💰 *Precio:* ${formatPrice(service.priceInCOP)}`,
//   ].join('\n')

//   await sendButtonMessage(to, summary, [
//     {
//       id: `book_${serviceId}_${modShort}_${storeIdStr}_${staffId}_${dateCode}_${timeCode}`,
//       title: 'Confirmar',
//     },
//     { id: 'cancel', title: 'Cancelar' },
//   ])
// }

// // --- Step 8: Create booking ---

// export async function createBooking(
//   payload: Payload,
//   to: string,
//   serviceId: number,
//   modShort: string,
//   storeIdStr: string,
//   staffId: number,
//   dateCode: string,
//   timeCode: string,
// ): Promise<void> {
//   try {
//     const customerId = await findUserByPhone(payload, to)

//     if (!customerId) {
//       await sendTextMessage(to, 'Necesitas registrarte primero.')
//       await showWelcome(payload, to)
//       return
//     }

//     const modality = SHORT_TO_MODALITY[modShort]

//     const year = parseInt(dateCode.slice(0, 4))
//     const month = parseInt(dateCode.slice(4, 6)) - 1
//     const day = parseInt(dateCode.slice(6, 8))
//     const hour = parseInt(timeCode.slice(0, 2))
//     const minute = parseInt(timeCode.slice(2, 4))
//     const localDate = new Date(year, month, day, hour, minute)
//     const utcDatetime = localToUTCString(localDate)

//     const bookingData: Partial<Booking> = {
//       customer: customerId,
//       datetime: utcDatetime,
//       service: serviceId,
//       staff: staffId,
//       modality,
//     }

//     if (modality === 'inStore' && storeIdStr !== '0') {
//       bookingData.store = parseInt(storeIdStr)
//     }

//     await payload.create({
//       collection: 'bookings',
//       data: bookingData as Booking,
//       overrideAccess: true,
//       context: { skipAssignCustomer: true },
//     })

//     const service = await payload.findByID({ collection: 'services', id: serviceId, depth: 0, overrideAccess: true })

//     await sendTextMessage(
//       to,
//       [
//         '✅ *¡Tu cita ha sido agendada!*',
//         '',
//         `📅 ${formatDateFromCode(dateCode)} a las ${formatTime(timeCode)}`,
//         `✂️ ${service.title}`,
//       ].join('\n'),
//     )
//     await showWelcome(payload, to)
//   } catch (error) {
//     console.error('[WhatsApp Bot] Error creating booking:', error)
//     await sendTextMessage(to, 'Hubo un error al crear tu reserva. Por favor intenta de nuevo.')
//     await showWelcome(payload, to)
//   }
// }

// // --- My Bookings: show upcoming bookings + option to cancel ---

// export async function showMyBookings(payload: Payload, to: string): Promise<void> {
//   const customerId = await findUserByPhone(payload, to)

//   if (!customerId) {
//     await sendTextMessage(to, 'No tienes citas registradas.')
//     await showWelcome(payload, to)
//     return
//   }

//   const { docs: bookings } = await payload.find({
//     collection: 'bookings',
//     where: {
//       and: [
//         { customer: { equals: customerId } },
//         { datetime: { greater_than: new Date().toISOString() } },
//       ],
//     },
//     sort: 'datetime',
//     depth: 1,
//     limit: 10,
//     overrideAccess: true,
//   })

//   if (bookings.length === 0) {
//     await sendTextMessage(to, 'No tienes citas próximas.')
//     await showWelcome(payload, to)
//     return
//   }

//   // Show bookings as text summary
//   const lines = bookings.map((b, i) => {
//     const serviceName = typeof b.service === 'number' ? 'Servicio' : b.service.title
//     const staffName = typeof b.staff === 'number' ? '' : ` · 👤 ${b.staff.name}`
//     return `${i + 1}. ✂️ *${serviceName}*\n   📅 ${formatDatetimeUTC(b.datetime)}${staffName}`
//   })

//   const summary = ['📋 *Tus próximas citas*', '', ...lines.join('\n\n').split('\n')].join('\n')

//   await sendTextMessage(to, summary)

//   await sendButtonMessage(to, '¿Qué deseas hacer?', [
//     { id: 'cancel_pick', title: 'Cancelar una cita' },
//     { id: 'cancel', title: 'Volver al menú' },
//   ])
// }

// export async function showCancelPicker(payload: Payload, to: string): Promise<void> {
//   const customerId = await findUserByPhone(payload, to)

//   if (!customerId) {
//     await sendTextMessage(to, 'No tienes citas registradas.')
//     await showWelcome(payload, to)
//     return
//   }

//   const { docs: bookings } = await payload.find({
//     collection: 'bookings',
//     where: {
//       and: [
//         { customer: { equals: customerId } },
//         { datetime: { greater_than: new Date().toISOString() } },
//       ],
//     },
//     sort: 'datetime',
//     depth: 1,
//     limit: 9,
//     overrideAccess: true,
//   })

//   if (bookings.length === 0) {
//     await sendTextMessage(to, 'No tienes citas próximas para cancelar.')
//     await showWelcome(payload, to)
//     return
//   }

//   await sendListMessage(to, 'Selecciona la cita que deseas cancelar:', 'Ver citas', [
//     {
//       title: 'Tus citas',
//       rows: [
//         ...bookings.map((b) => {
//           const serviceName = typeof b.service === 'number' ? 'Servicio' : b.service.title
//           return {
//             id: `mybk_${b.id}`,
//             title: serviceName.slice(0, 24),
//             description: formatDatetimeUTC(b.datetime),
//           }
//         }),
//         { id: 'cancel', title: 'Volver al menú' },
//       ],
//     },
//   ])
// }

// export async function confirmCancelBooking(
//   payload: Payload,
//   to: string,
//   bookingId: number,
// ): Promise<void> {
//   try {
//     const booking = await payload.findByID({
//       collection: 'bookings',
//       id: bookingId,
//       depth: 1,
//       overrideAccess: true,
//     })

//     const serviceName = typeof booking.service === 'number' ? 'Servicio' : booking.service.title
//     const staffName = typeof booking.staff === 'number' ? '' : booking.staff.name

//     await sendButtonMessage(
//       to,
//       `¿Confirmas cancelar esta cita?\n\n✂️ ${serviceName}\n👤 ${staffName}\n📅 ${formatDatetimeUTC(booking.datetime)}`,
//       [
//         { id: `cbk_${bookingId}`, title: 'Sí, cancelar' },
//         { id: 'cancel', title: 'No, volver' },
//       ],
//     )
//   } catch {
//     await sendTextMessage(to, 'No se encontró la cita.')
//     await showWelcome(payload, to)
//   }
// }

// export async function deleteBooking(
//   payload: Payload,
//   to: string,
//   bookingId: number,
// ): Promise<void> {
//   try {
//     await payload.delete({
//       collection: 'bookings',
//       id: bookingId,
//       overrideAccess: true,
//     })

//     await sendTextMessage(to, '✅ Tu cita ha sido cancelada.')
//     await showWelcome(payload, to)
//   } catch {
//     await sendTextMessage(to, 'Hubo un error al cancelar la cita. Intenta de nuevo.')
//     await showWelcome(payload, to)
//   }
// }
