import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import {
  AlignFeature,
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from '@/infrastructure/collections/media.collection'
import { Footer } from '@/infrastructure/footer/footer.global'
import { Configuration } from '@/infrastructure/globals/configuration.global'
import { Header } from '@/infrastructure/header/header.global'
import { Users } from '@/modules/auth/collections/auth/auth.collection'
import { SocialSelling } from '@/modules/pages/blocks/social-selling/social-selling.collection'
import { Pages } from '@/modules/pages/collections/pages.collection'
import { Categories } from '@/modules/products/collections/categories.collection'
import { Cities } from '@/modules/shipping/collections/cities.collection'
import { Countries } from '@/modules/shipping/collections/countries.collection'
import { WhatsAppAccounts } from '@/modules/whatsapp/collections/whatsapp-accounts/whatsapp-accounts.collection'
import { WhatsAppMessages } from '@/modules/whatsapp/collections/whatsapp-messages/whatsapp-messages.collection'
import { plugins } from './infrastructure/plugins/plugins.config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      afterNavLinks: [
        '@/modules/admin/components/calendar-nav-link-container/calendar-nav-link-container.component#CalendarNavLinkContainer',
      ],
      views: {
        calendar: {
          Component:
            '@/modules/admin/components/calendar-page/calendar-page.component#CalendarPage',
          path: '/calendar',
        },
      },
    },
    user: Users.slug,
  },
  collections: [Users, Pages, Categories, Media, SocialSelling, Countries, Cities, WhatsAppAccounts, WhatsAppMessages],
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: (_, siblingData: Record<string, unknown>) =>
                    siblingData.linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        AlignFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  //email: nodemailerAdapter(),
  endpoints: [],
  globals: [Header, Footer, Configuration],
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
  i18n: {
    supportedLanguages: { en, es },
    translations: {
      en: {
        custom: {
          calendar: 'Calendar',
          errorIncompleteData: 'Incomplete data',
          errorUnknown: 'Unknown error',
          bookingStoreNotOffersService: 'The store does not offer this service',
          bookingStaffNotOffersService: 'The staff member does not offer this service',
          bookingStaffNotAssignedToStore: 'The staff member is not assigned to the booking store',
          bookingNoDatetimeOverlapBooking:
            'The selected date and time overlaps with another booking for this staff member',
          bookingNoDatetimeOverlapBlock:
            'The selected date and time overlaps with a block for this staff member',
          bookingStaffNotOffersDelivery: 'The staff member does not offer delivery',
          bookingOutsideStaffSchedule: 'The booking is outside of the staff member schedule',
          storeServicesNotSupportInStore: 'Some selected services are not supported in-store',
          cartItemWhatsAppOnly: 'This product is only available through WhatsApp',
          cartItemOutOfStock: 'This product is out of stock or has insufficient inventory',
          notLoggedIn: 'You must be logged in to perform this action',
          systemPageTitle: 'This page is managed by the platform',
          systemPageDescriptionPrefix: 'This page is auto-generated and represents the route',
          systemPageDescriptionSuffix:
            '. Its content is built by the application code and cannot be modified from this panel.',
        },
      },
      es: {
        custom: {
          calendar: 'Calendario',
          calendarToday: 'Hoy',
          calendarLoading: 'Cargando...',
          calendarBlockSchedule: 'Bloquear horario',
          calendarViewDay: 'Día',
          calendarViewWeek: 'Semana',
          calendarViewMonth: 'Mes',
          calendarBlocked: 'Bloqueado',
          calendarInStore: 'En tienda',
          calendarDelivery: 'A domicilio',
          calendarOnline: 'Online',
          calendarTime: 'Hora',
          calendarDuration: 'Duración',
          calendarProfessional: 'Profesional',
          calendarClient: 'Cliente',
          calendarModality: 'Modalidad',
          calendarViewBooking: 'Ver reserva',
          calendarDeleteBlock: 'Eliminar bloqueo',
          calendarBlockAgenda: 'Bloquear agenda',
          calendarDate: 'Fecha',
          calendarAllDay: 'Todo el día',
          calendarStartTime: 'Inicio',
          calendarEndTime: 'Fin',
          calendarReason: 'Motivo',
          calendarReasonPlaceholder: 'Almuerzo, reunión, personal...',
          calendarSaving: 'Guardando...',
          calendarRecurrence: 'Recurrencia',
          calendarRecurrenceOnce: 'Una vez',
          calendarRecurrenceUntil: 'Hasta una fecha',
          calendarRecurrenceForever: 'Para siempre',
          calendarRecurrenceOnceDesc: 'Bloquear un día específico',
          calendarRecurrenceUntilDesc: 'Se repite cada semana hasta una fecha',
          calendarRecurrenceForeverDesc: 'Se repite cada semana sin fin',
          calendarWeekDays: 'Días de la semana',
          calendarUntilDate: 'Fecha límite',
          calendarFromDate: 'Fecha de inicio',
          calendarFromDateHint: 'Opcional. Si se deja vacío, el bloqueo empieza desde hoy.',
          calendarSummarySince: 'desde',
          calendarWhen: 'Cuándo',
          calendarFallbackService: 'Servicio',
          calendarFallbackStaff: 'Profesional',
          calendarFallbackCustomer: 'Cliente',
          calendarMore: 'más',
          calendarClose: 'Cerrar',
          calendarPrev: 'Anterior',
          calendarNext: 'Siguiente',
          calendarSchedule: 'Horario',
          calendarSummary: 'Resumen',
          calendarSummaryEvery: 'Cada',
          calendarSummaryFrom: 'de',
          calendarSummaryTo: 'a',
          calendarSummaryUntil: 'hasta',
          calendarSummaryAllDay: 'todo el día',
          calendarSummaryOnDate: 'el',
          calendarSummaryNoDays: 'Elige al menos un día de la semana',
          calendarErrorTitle: 'No se pudo guardar el bloqueo',
          calendarSelectStaff: 'Selecciona un profesional',
          calendarReasonOptional: 'Motivo (opcional)',
          calendarDayMon: 'Lun',
          calendarDayTue: 'Mar',
          calendarDayWed: 'Mié',
          calendarDayThu: 'Jue',
          calendarDayFri: 'Vie',
          calendarDaySat: 'Sáb',
          calendarDaySun: 'Dom',
          errorIncompleteData: 'Datos incompletos',
          errorUnknown: 'Error desconocido',
          bookingStoreNotOffersService: 'La tienda no ofrece este servicio',
          bookingStaffNotOffersService: 'El profesional no ofrece este servicio',
          bookingStaffNotAssignedToStore:
            'El profesional no está asignado a la tienda de la reserva',
          bookingNoDatetimeOverlapBooking:
            'La fecha y hora seleccionadas se pisan con otra reserva para este profesional',
          bookingNoDatetimeOverlapBlock:
            'La fecha y hora seleccionadas se pisan con un bloqueo para este profesional',
          bookingStaffNotOffersDelivery: 'El profesional no ofrece servicio a domicilio',
          bookingOutsideStaffSchedule: 'La reserva está fuera del horario laboral del profesional',
          storeServicesNotSupportInStore:
            'Algún servicio seleccionado no es compatible con la modalidad en tienda',
          cartItemWhatsAppOnly: 'Este producto solo está disponible por WhatsApp',
          cartItemOutOfStock: 'Este producto está agotado o no tiene inventario suficiente',
          notLoggedIn: 'Debes iniciar sesión para realizar esta acción',
          systemPageTitle: 'Esta página es administrada por la plataforma',
          systemPageDescriptionPrefix:
            'Esta página es generada automáticamente y representa la ruta',
          systemPageDescriptionSuffix:
            '. Su contenido es construido por el código de la aplicación y no puede ser modificado desde este panel.',
        },
      },
    },
  },
})
