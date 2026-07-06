// import { getPayload } from 'payload'
// import config from '@payload-config'
// import type { WhatsAppWebhookBody, WhatsAppMessage } from './types'
// import { sendTextMessage } from './client'
// import { findUserByPhone } from './helpers'
// import {
//   showWelcome,
//   showCatalog,
//   startBookingFlow,
//   showModalities,
//   showStores,
//   showStaff,
//   showDates,
//   showTimeSlots,
//   showConfirmation,
//   createBooking,
//   showMyBookings,
//   showCancelPicker,
//   confirmCancelBooking,
//   deleteBooking,
//   processEmail,
// } from './steps'

// /** Keywords that signal the user wants a human advisor */
// const ADVISOR_KEYWORDS = [
//   'asesor', 'asesora', 'agente', 'humano', 'persona real',
//   'hablar con alguien', 'hablar con una persona', 'atención humana',
//   'operador', 'operadora', 'representante', 'soporte', 'ayuda real',
//   'queja', 'reclamo', 'problema',
// ]

// /** Check if the text indicates the user wants to talk to a human */
// function wantsAdvisor(text: string): boolean {
//   const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
//   return ADVISOR_KEYWORDS.some((kw) => {
//     const normalized = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
//     return lower.includes(normalized)
//   })
// }

// /** Extract the actionable ID from an incoming WhatsApp message */
// function extractActionId(message: WhatsAppMessage): { actionId: string | null; text: string | null } {
//   if (message.interactive) {
//     return {
//       actionId:
//         message.interactive.button_reply?.id ??
//         message.interactive.list_reply?.id ??
//         null,
//       text: null,
//     }
//   }
//   return { actionId: null, text: message.text?.body ?? null }
// }

// /** Route an action ID to the correct step handler */
// async function routeAction(to: string, actionId: string | null, text: string | null, contactName?: string): Promise<void> {
//   const payload = await getPayload({ config })

//   // Plain text → check intent
//   if (!actionId) {
//     // User wants a human advisor → acknowledge and step aside
//     if (text && wantsAdvisor(text)) {
//       console.log(`[WhatsApp Bot] from=${to} → advisor request, stepping aside`)
//       await sendTextMessage(
//         to,
//         [
//           '🙋‍♂️ *¡Entendido!*',
//           '',
//           'En unos minutos uno de nuestros asesores se conectará a este chat para atenderte personalmente.',
//           '',
//           'Mientras tanto, si necesitas algo rápido puedes escribir *"menú"* para volver al asistente automático.',
//         ].join('\n'),
//       )
//       return
//     }

//     const userId = await findUserByPhone(payload, to)
//     if (userId) {
//       const user = await payload.findByID({
//         collection: 'users',
//         id: userId,
//         depth: 0,
//         overrideAccess: true,
//       })

//       // Email is placeholder → waiting for email
//       if (user.email?.endsWith('@whatsapp.placeholder')) {
//         await processEmail(payload, to, text, contactName)
//         return
//       }
//     }

//     await showWelcome(payload, to, contactName)
//     return
//   }

//   // Cancel / back to start → show welcome
//   if (actionId === 'cancel') {
//     await showWelcome(payload, to, contactName)
//     return
//   }

//   // Menu buttons
//   if (actionId === 'menu_catalog') {
//     await showCatalog(payload, to)
//     return
//   }

//   if (actionId === 'menu_bookings') {
//     await showMyBookings(payload, to)
//     return
//   }

//   // "Cancelar una cita" from my bookings
//   if (actionId === 'cancel_pick') {
//     await showCancelPicker(payload, to)
//     return
//   }

//   // "Agendar cita" from catalog → check registration first
//   if (actionId === 'book_start') {
//     await startBookingFlow(payload, to, contactName)
//     return
//   }

//   const parts = actionId.split('_')
//   const prefix = parts[0]

//   switch (prefix) {
//     // svc_<serviceId>
//     case 'svc': {
//       const serviceId = parseInt(parts[1])
//       await showModalities(payload, to, serviceId)
//       break
//     }

//     // mod_<serviceId>_<modShort>
//     case 'mod': {
//       const serviceId = parseInt(parts[1])
//       const modShort = parts[2]
//       if (modShort === 'is') {
//         // inStore → show stores
//         await showStores(payload, to, serviceId)
//       } else {
//         // delivery → show staff (no store)
//         await showStaff(payload, to, serviceId, modShort, null)
//       }
//       break
//     }

//     // str_<serviceId>_<storeId>
//     case 'str': {
//       const serviceId = parseInt(parts[1])
//       const storeId = parseInt(parts[2])
//       await showStaff(payload, to, serviceId, 'is', storeId)
//       break
//     }

//     // stf_<serviceId>_<modShort>_<storeId>_<staffId>
//     case 'stf': {
//       const serviceId = parseInt(parts[1])
//       const modShort = parts[2]
//       const storeIdStr = parts[3]
//       const staffId = parseInt(parts[4])
//       await showDates(payload, to, serviceId, modShort, storeIdStr, staffId)
//       break
//     }

//     // date_<serviceId>_<modShort>_<storeId>_<staffId>_<YYYYMMDD>
//     case 'date': {
//       const serviceId = parseInt(parts[1])
//       const modShort = parts[2]
//       const storeIdStr = parts[3]
//       const staffId = parseInt(parts[4])
//       const dateCode = parts[5]
//       await showTimeSlots(payload, to, serviceId, modShort, storeIdStr, staffId, dateCode)
//       break
//     }

//     // time_<serviceId>_<modShort>_<storeId>_<staffId>_<YYYYMMDD>_<HHmm>
//     case 'time': {
//       const serviceId = parseInt(parts[1])
//       const modShort = parts[2]
//       const storeIdStr = parts[3]
//       const staffId = parseInt(parts[4])
//       const dateCode = parts[5]
//       const timeCode = parts[6]
//       await showConfirmation(payload, to, serviceId, modShort, storeIdStr, staffId, dateCode, timeCode)
//       break
//     }

//     // book_<serviceId>_<modShort>_<storeId>_<staffId>_<YYYYMMDD>_<HHmm>
//     case 'book': {
//       const serviceId = parseInt(parts[1])
//       const modShort = parts[2]
//       const storeIdStr = parts[3]
//       const staffId = parseInt(parts[4])
//       const dateCode = parts[5]
//       const timeCode = parts[6]
//       await createBooking(payload, to, serviceId, modShort, storeIdStr, staffId, dateCode, timeCode)
//       break
//     }

//     // mybk_<bookingId> — user selected a booking to cancel
//     case 'mybk': {
//       const bookingId = parseInt(parts[1])
//       await confirmCancelBooking(payload, to, bookingId)
//       break
//     }

//     // cbk_<bookingId> — user confirmed cancellation
//     case 'cbk': {
//       const bookingId = parseInt(parts[1])
//       await deleteBooking(payload, to, bookingId)
//       break
//     }

//     default: {
//       await showWelcome(payload, to, contactName)
//     }
//   }
// }

// /** Main entry point: process a WhatsApp webhook body */
// export async function handleWhatsAppMessage(body: WhatsAppWebhookBody): Promise<void> {
//   if (body.object !== 'whatsapp_business_account') return

//   for (const entry of body.entry) {
//     for (const change of entry.changes) {
//       const messages = change.value?.messages
//       if (!messages) continue

//       const contactName = change.value?.contacts?.[0]?.profile?.name

//       for (const message of messages) {
//         const from = message.from
//         const { actionId, text } = extractActionId(message)

//         console.log(`[WhatsApp Bot] from=${from} actionId=${actionId ?? '(text)'}`)

//         try {
//           await routeAction(from, actionId, text, contactName)
//         } catch (error) {
//           console.error('[WhatsApp Bot] Error handling message:', error)
//         }
//       }
//     }
//   }
// }
