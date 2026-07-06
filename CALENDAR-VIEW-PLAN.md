# Plan: Vista de calendario admin con Schedule-X

## Context

Hoy `src/modules/admin/components/calendar-page/calendar-page.component.tsx` es un cascarón que solo monta `DefaultTemplate` de Payload con un `<div />` vacío. Está registrado en `payload.config.ts` bajo `views.calendar` (path `/calendar`) y hay 60+ keys i18n `custom.calendar*` ya pre-registradas.

El objetivo es renderizar dentro de esa vista un calendario responsive (mobile + desktop) que:

1. Muestre **bookings** existentes filtrados por staff (`?where[staff][equals]=…&where[startDatetime][between]=…`).
2. Muestre **staff-blocks** del mismo staff.
3. Permita **crear staff-blocks** (one-off o recurrentes por días de semana) al clickear sobre un slot del grid, abriendo una modal con el form.
4. Use **Schedule-X** (`@schedule-x/react`) como motor del grid — elegido por: mobile responsive nativo, theming via CSS variables, TS first-class, bundle liviano y mantenimiento activo.

El modelo `staff-blocks` se interpreta así: `repeat` vacío ⇒ bloqueo único (los datetimes completos de `startTime`/`endTime` valen tal cual); `repeat` con weekdays ⇒ bloqueo semanal recurrente (solo la porción horaria de `startTime`/`endTime` aplica).

## Decisiones de arquitectura

| Decisión                           | Resolución                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server vs client                   | `calendar-page.component.tsx` queda server (monta `DefaultTemplate`, traduce strings con `req.t('custom:…')`, los pasa por props). Toda la lógica del calendario vive en `calendar-page.component.client.tsx`.                                                                                                                                                                     |
| Hook principal                     | `use-calendar-page.ts` siguiendo container/presentational del proyecto.                                                                                                                                                                                                                                                                                                            |
| **UI primitives dentro del admin** | **Usar `@payloadcms/ui` para todo lo que no sea el grid del calendario.** `Modal` + `useModal` para el form de creación de bloqueo (responsive nativo: full-screen en mobile, centrado en desktop). `DatePicker`, `ReactSelect`, `Button`, `Banner` para inputs/CTAs. **No se importa shadcn en esta vista** — evita el problema de Tailwind+preflight en el segmento `(payload)`. |
| CSS scope                          | Solo importamos `@schedule-x/theme-default/dist/index.css` y un mini `admin-calendar.css` con las CSS vars de Schedule-X mapeadas a los tokens `--theme-*` de Payload. Nada de `@import 'tailwindcss'` en admin.                                                                                                                                                                   |
| SWR en admin                       | `SwrProvider` solo está en `(app)`. El client component envuelve su árbol en `<SwrProvider>` local (de `@/infrastructure/swr/swr.provider.client`).                                                                                                                                                                                                                                |
| Fetching                           | SWR contra REST de Payload (convención del repo: keys relativos, fetcher global). Endpoints: `/api/staff`, `/api/bookings`, `/api/staff-blocks`.                                                                                                                                                                                                                                   |
| Crear bloqueo                      | POST a `/api/staff-blocks` directo desde el hook del form. Acceso ya está garantizado por `adminOnly` en la colección. No se introduce `bl/`/`uc/` nuevo para la creación en este PR.                                                                                                                                                                                              |
| i18n                               | Reusar las 60+ keys ya registradas. El server traduce y pasa un objeto `t` plano por props al client.                                                                                                                                                                                                                                                                              |
| Recurrencia en el form             | Toggle "Único / Recurrente". Único ⇒ `DatePicker` (date+time) inicio + fin. Recurrente ⇒ `DatePicker` (time only) inicio + fin + multi-select de weekdays (`ReactSelect` multi). Mapeo final al schema: ambos guardan `startTime`/`endTime` como ISO datetimes; recurrente además guarda `repeat`.                                                                                 |

## Stack a instalar

```
@schedule-x/react
@schedule-x/calendar
@schedule-x/theme-default
@schedule-x/events-service
@schedule-x/drag-and-drop      (opcional, para mover bloqueos)
@schedule-x/current-time       (línea de hora actual)
```

`@payloadcms/ui` ya está como dependencia (es transitive de Payload). Validar con `pnpm tsc --noEmit` al final.

## Archivos a crear / modificar

```
src/modules/admin/components/calendar-page/
├── calendar-page.component.tsx              (MODIFICAR — traduce y pasa props)
├── calendar-page.component.client.tsx       (NUEVO — monta Schedule-X + SwrProvider local)
├── use-calendar-page.ts                     (NUEVO — selector de staff, rango visible, merge de eventos)
├── admin-calendar.css                       (NUEVO — solo CSS vars de Schedule-X, mapeadas a --theme-*)
└── components/
    ├── staff-filter/
    │   ├── staff-filter.component.client.tsx   (usa ReactSelect de @payloadcms/ui)
    │   └── use-staff-filter.ts
    └── block-form/
        ├── block-form.component.client.tsx      (Modal de @payloadcms/ui + DatePicker + ReactSelect)
        └── use-block-form.ts                     (estado + POST a /api/staff-blocks)

src/modules/bookings/bl/
└── expand-block-events.bl.ts                (NUEVO — pura: expande bloqueos recurrentes en un rango)

tests/int/bookings/
└── expand-block-events.int.spec.ts          (NUEVO — cubre one-off, recurrente parcial, DST)

docs/QA-MANUAL-TEST-PLAN.md                  (MODIFICAR — agregar EPIC J)
```

## Archivos a reusar (no modificar)

- `src/infrastructure/swr/swr.provider.client.tsx` — proveedor SWR.
- `src/infrastructure/swr/swr.fetcher.ts` — fetcher global.
- `src/modules/bookings/fields/week-days-select.field.ts` — lista canónica de weekdays (`monday`…`sunday`).
- `src/payload-types.ts` — tipos de `Booking`, `StaffBlock`, `Staff`.
- `@payloadcms/ui` exports: `Modal`, `useModal`, `DatePicker`, `ReactSelect`, `Button`, `Banner`, `Toasts`.

## Patrón de fetching (siguiendo la convención SWR del repo)

```ts
// dentro de use-calendar-page.ts
const { data: staffList } = useSWR<PaginatedDocs<Staff>>('/api/staff?limit=200&depth=0')

const { data: bookings } = useSWR<PaginatedDocs<Booking>>(
  selectedStaffId
    ? `/api/bookings?where[staff][equals]=${selectedStaffId}` +
        `&where[startDatetime][greater_than_equal]=${rangeStart.toISOString()}` +
        `&where[startDatetime][less_than_equal]=${rangeEnd.toISOString()}` +
        `&depth=1&limit=500`
    : null,
)

const { data: blocks } = useSWR<PaginatedDocs<StaffBlock>>(
  selectedStaffId
    ? `/api/staff-blocks?where[staff][equals]=${selectedStaffId}&depth=0&limit=500`
    : null,
)
```

Tras crear/editar un bloque, llamar `mutate` sobre los keys de blocks.

## Mapeo a eventos Schedule-X

`use-calendar-page.ts` expone un `events: ScheduleXEvent[]` derivado de `bookings + blocks`:

- **Booking** → `{ id: 'booking-<id>', start, end, title: customer.name, calendarId: 'booking-<modality>' }` (calendarIds: `booking-inStore`, `booking-delivery`, cada uno con color distinto vía `calendars` config).
- **Block one-off** (`repeat=[]`) → `{ id: 'block-<id>', start: startTime, end: endTime, calendarId: 'block', title: reason ?? t.calendarBlocked }`.
- **Block recurrente** (`repeat` con weekdays) → expandido por `expand-block-events.bl.ts` (función pura) a N eventos dentro del rango visible. Inputs: `block`, `[rangeStart, rangeEnd]`. Output: `Array<{ start, end }>`.

## Flujo de creación de bloqueo (interacción)

1. Usuario click sobre un slot vacío del grid → Schedule-X dispara `onClickDateTime` (vista day/week) o `onClickDate` (vista month).
2. `use-calendar-page.ts` captura el datetime y abre la modal pasando `{ initialDate, staffId: selectedStaffId }`.
3. `block-form` renderiza un `<Modal slug="create-block">` de `@payloadcms/ui`. En mobile ocupa toda la pantalla; en desktop aparece centrada.
4. Form fields (`@payloadcms/ui`):
   - `reason` — `TextInput` (opcional).
   - Toggle modo: `Único | Recurrente` — `ReactSelect` o un `RadioGroup` propio liviano.
   - **Único:** `DatePicker` (date+time) para inicio y fin.
   - **Recurrente:** `DatePicker` (timeOnly) para inicio y fin + `ReactSelect isMulti` con los 7 weekdays.
   - `staff` — preseleccionado al filtro activo; se puede cambiar con otro `ReactSelect` poblado de staffList.
   - CTAs: `Button` "Guardar" / `Button buttonStyle="secondary"` "Cancelar".
5. Submit → arma payload, `POST /api/staff-blocks` (Payload fetch helper o `fetch` directo con `credentials: 'include'`), `mutate` SWR key de blocks, cierra modal, toast de éxito vía `Toasts` de Payload.
6. Errores → `Banner type="error"` adentro del modal con el `message` de la respuesta Payload.

## Modificación al `calendar-page.component.tsx`

```ts
import { CalendarPageClient } from './calendar-page.component.client'
import './admin-calendar.css'

export const CalendarPage: React.FC<AdminViewServerProps> = (props) => {
  const { req, locale, permissions, searchParams, params, visibleEntities } =
    props.initPageResult
  // @ts-expect-error — custom keys
  const t = {
    today: req.t('custom:calendarToday'),
    viewDay: req.t('custom:calendarViewDay'),
    /* …todas las keys que el client necesita… */
  }
  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <CalendarPageClient t={t} />
    </DefaultTemplate>
  )
}
```

## Pasos de ejecución

1. Instalar dependencias Schedule-X (`pnpm add @schedule-x/react @schedule-x/calendar @schedule-x/theme-default @schedule-x/events-service @schedule-x/drag-and-drop @schedule-x/current-time`).
2. Crear `admin-calendar.css` mapeando CSS vars de Schedule-X (`--sx-color-primary`, `--sx-color-background`, etc.) a tokens existentes de Payload (`--theme-elevation-0`, `--theme-text`, `--theme-success-500`, etc.).
3. Crear `expand-block-events.bl.ts` + test unitario en `tests/int/bookings/expand-block-events.int.spec.ts`.
4. Crear `use-calendar-page.ts` con el fetching SWR y el merge de eventos (usando la BL del paso 3).
5. Crear `staff-filter` (usando `ReactSelect` de `@payloadcms/ui`).
6. Crear `block-form` con `Modal` + `useModal` + `DatePicker` + `ReactSelect` + `Button` de `@payloadcms/ui`, y POST a `/api/staff-blocks`.
7. Crear `calendar-page.component.client.tsx` que envuelve todo en `<SwrProvider>` local y monta Schedule-X conectado a los handlers de creación.
8. Modificar `calendar-page.component.tsx` para pasar las strings traducidas.
9. Agregar EPIC J al QA plan (ver sección abajo).
10. Validar: `pnpm generate:types && pnpm tsc --noEmit && pnpm lint`.

## QA — Casos de prueba a agregar a `docs/QA-MANUAL-TEST-PLAN.md`

Agregar **EPIC J — Admin: Calendario de reservas (solo `features.services`)** al final del archivo, antes de la sección de cierre.

### Estructura propuesta:

```markdown
## EPIC J — Admin: Calendario de reservas (solo `features.services`)

Cubre: `src/modules/admin/components/calendar-page/`. Ruta: `/admin/calendar`.
Acceso restringido a usuarios admin (`adminOnly`). Todos los TC se ejecutan en config C2 o C3.

### HU-J1 — Como admin quiero ver la vista de calendario

Cubre: registro de la view, link en sidebar. → TC-J01, TC-J02, TC-J03

### HU-J2 — Como admin quiero filtrar por profesional

Cubre: `staff-filter`. → TC-J04, TC-J05

### HU-J3 — Como admin quiero ver las reservas existentes en el calendario

Cubre: fetch + render de bookings. → TC-J06, TC-J07, TC-J08, TC-J09

### HU-J4 — Como admin quiero ver los bloqueos existentes en el calendario

Cubre: fetch + render + expansión de bloqueos recurrentes. → TC-J10, TC-J11, TC-J12

### HU-J5 — Como admin quiero crear un bloqueo único desde el calendario

Cubre: click slot → modal → submit. → TC-J13, TC-J14, TC-J15

### HU-J6 — Como admin quiero crear un bloqueo recurrente desde el calendario

Cubre: form modo recurrente, weekdays. → TC-J16, TC-J17

### HU-J7 — Como admin quiero el calendario responsive en mobile

Cubre: viewport <768px, modal full-screen. → TC-J18, TC-J19

### HU-J8 — Como admin quiero navegar entre vistas y períodos

Cubre: toggles day/week/month, navegación prev/today/next. → TC-J20, TC-J21

| ID     | Precondición                                         | Pasos                                                                              | Resultado esperado                                                                                                                        |
| ------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| TC-J01 | Usuario admin logueado, `features.services=true`     | Ir a `/admin/calendar`                                                             | Renderiza `DefaultTemplate` con grid Schedule-X visible (vista semana por defecto, día actual marcado); título "Calendario" en breadcrumb |
| TC-J02 | Usuario no-admin logueado                            | Ir a `/admin/calendar`                                                             | Redirige a login o muestra error de permisos (mismo comportamiento que otras vistas admin)                                                |
| TC-J03 | `features.services=false`                            | Verificar sidebar                                                                  | El link "Calendario" no aparece (controlado por `calendar-nav-link-container`)                                                            |
| TC-J04 | Existen ≥2 staff publicados                          | Abrir el select de filtro                                                          | Lista de staff con nombre y foto (si tiene); seleccionar uno actualiza el calendario                                                      |
| TC-J05 | Sin staff seleccionado (estado inicial)              | Ver el grid                                                                        | Mensaje vacío "Seleccioná un profesional" o equivalente; no se hace fetch de bookings/blocks                                              |
| TC-J06 | Staff con 3 bookings la semana actual                | Seleccionar ese staff                                                              | Los 3 bookings aparecen en sus slots correctos, con color según `modality`                                                                |
| TC-J07 | Booking de modality `inStore`                        | Inspeccionar visualmente                                                           | Color/badge corresponde al calendarId `booking-inStore`                                                                                   |
| TC-J08 | Booking de modality `delivery`                       | Inspeccionar visualmente                                                           | Color/badge corresponde al calendarId `booking-delivery`                                                                                  |
| TC-J09 | Click sobre un booking existente                     | —                                                                                  | Abre detalle/edit-view del booking en `/admin/collections/bookings/<id>` (link directo, no modal de creación)                             |
| TC-J10 | Staff con bloqueo one-off mañana 14-15h              | Seleccionar staff, navegar a mañana                                                | El bloqueo aparece pintado en 14-15h con `reason` o "Bloqueado" como título                                                               |
| TC-J11 | Staff con bloqueo recurrente lun+mié 12-13h          | Vista semana actual                                                                | El bloqueo aparece en lunes y miércoles de la semana visible en 12-13h                                                                    |
| TC-J12 | Mismo bloqueo recurrente, navegar 4 semanas adelante | Click "Next" 4 veces                                                               | El bloqueo sigue apareciendo en lun+mié de cada semana                                                                                    |
| TC-J13 | Staff seleccionado, vista semana                     | Click sobre slot vacío martes 10:00                                                | Abre Modal de Payload con form de bloqueo; modo "Único" preseleccionado; fecha inicio = martes 10:00                                      |
| TC-J14 | Modal abierta (TC-J13)                               | Completar `reason="Almuerzo"`, fin 11:00, click "Guardar"                          | Modal se cierra; toast de éxito; el bloqueo aparece inmediatamente en el grid sin refresh                                                 |
| TC-J15 | Modal abierta sin completar fin                      | Click "Guardar"                                                                    | Mensaje de error en el form (campo requerido o `endTime > startTime`); no se cierra                                                       |
| TC-J16 | Modal abierta                                        | Cambiar modo a "Recurrente", seleccionar weekdays `[lunes, miércoles]`, hora 12-13 | Form muestra `DatePicker timeOnly` (no date) + multi-select weekdays; click "Guardar"                                                     |
| TC-J17 | Después de TC-J16                                    | Verificar grid                                                                     | El bloqueo aparece en lunes y miércoles de la semana visible en 12-13h                                                                    |
| TC-J18 | Viewport <768px (iPhone)                             | Cargar `/admin/calendar`                                                           | Calendario en vista día por defecto (modo responsive de Schedule-X); navegación day-strip arriba                                          |
| TC-J19 | Mobile, click slot vacío                             | —                                                                                  | Modal abre ocupando full-screen; form scrolleable; CTAs visibles                                                                          |
| TC-J20 | Desktop, vista semana                                | Click "Day" / "Week" / "Month"                                                     | Grid cambia a la vista correspondiente; eventos siguen visibles                                                                           |
| TC-J21 | Vista semana                                         | Click "Prev" / "Next" / "Today"                                                    | El rango visible cambia; bookings/blocks se re-fetchean para el nuevo rango; "Today" vuelve a la semana actual                            |
```

## Verificación

- **Smoke manual** (`pnpm dev` → `http://localhost:3000/admin/calendar`): ejecutar TC-J01 a TC-J21 del QA plan.
- **Tipado:** `pnpm tsc --noEmit` debe pasar.
- **Lint:** `pnpm lint` sin errores.
- **Tests unitarios:** `pnpm test:int -- -t "expand-block-events"` cubriendo: one-off pasa-thru, recurrente en rango parcial, recurrente que cruza DST.
- **Verificación visual del scope CSS:** abrir otra vista de Payload (ej. `/admin/collections/bookings`) después de visitar `/admin/calendar` y confirmar que el CSS de Schedule-X **no** se filtró ni rompió la grilla nativa del admin.

## Fuera de alcance (para PR posteriores)

- Drag/resize de bookings (solo display por ahora — editar booking redirige al edit-view existente).
- Vista multi-recurso (column-per-staff) — descartada, usamos filtro.
- Fechas `fromDate`/`untilDate` para bloqueos (las i18n keys quedan declaradas pero no usadas; el modelo actual no las soporta).
- Soporte de `modality: online` si la colección lo agrega más adelante.
