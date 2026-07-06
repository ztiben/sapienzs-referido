// import { utcToLocal } from '@/modules/bookings/domain/bookings/timezone'

// const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
// const MONTH_NAMES_ES = [
//   'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
//   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
// ]

// /** Format price in COP */
// export function formatPrice(price: number | null | undefined): string {
//   if (!price) return 'Consultar precio'
//   return `$${price.toLocaleString('es-CO')} COP`
// }

// /** Format a date as "Lun 27 Feb" */
// export function formatDateShort(date: Date): string {
//   const dayName = DAY_NAMES_ES[date.getDay()].slice(0, 3)
//   const day = date.getDate()
//   const month = MONTH_NAMES_ES[date.getMonth()]
//   return `${dayName} ${day} ${month}`
// }

// /** Format YYYYMMDD to "Lunes 27 de Feb" */
// export function formatDateFromCode(yyyymmdd: string): string {
//   const year = parseInt(yyyymmdd.slice(0, 4))
//   const month = parseInt(yyyymmdd.slice(4, 6)) - 1
//   const day = parseInt(yyyymmdd.slice(6, 8))
//   const date = new Date(year, month, day)
//   const dayName = DAY_NAMES_ES[date.getDay()]
//   const monthName = MONTH_NAMES_ES[date.getMonth()]
//   return `${dayName} ${day} de ${monthName}`
// }

// /** Format HHmm to "8:00 AM" */
// export function formatTime(hhmm: string): string {
//   const h = parseInt(hhmm.slice(0, 2))
//   const m = hhmm.slice(2, 4)
//   const period = h >= 12 ? 'PM' : 'AM'
//   const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
//   return `${h12}:${m} ${period}`
// }

// /** Format duration in minutes to "1h 30min" or "45min" */
// export function formatDuration(minutes: number): string {
//   const h = Math.floor(minutes / 60)
//   const m = minutes % 60
//   if (h === 0) return `${m}min`
//   if (m === 0) return `${h}h`
//   return `${h}h ${m}min`
// }

// /** Format a UTC ISO datetime to "Lun 27 Feb 8:00 AM" in business-local time */
// export function formatDatetimeUTC(isoString: string): string {
//   const local = utcToLocal(isoString)
//   const dayName = DAY_NAMES_ES[local.getDay()].slice(0, 3)
//   const day = local.getDate()
//   const month = MONTH_NAMES_ES[local.getMonth()]
//   const h = local.getHours()
//   const m = String(local.getMinutes()).padStart(2, '0')
//   const period = h >= 12 ? 'PM' : 'AM'
//   const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
//   return `${dayName} ${day} ${month} ${h12}:${m} ${period}`
// }

// /** Encode date as YYYYMMDD */
// export function encodeDateCode(date: Date): string {
//   const y = date.getFullYear()
//   const m = String(date.getMonth() + 1).padStart(2, '0')
//   const d = String(date.getDate()).padStart(2, '0')
//   return `${y}${m}${d}`
// }

// /** Encode time as HHmm */
// export function encodeTimeCode(hour: number, minute: number): string {
//   return `${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}`
// }
