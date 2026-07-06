# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the codebase used to build the web applications for clients of the _Zoren.io_ e-commerce platform. It is a virtual store where two worlds coexist: _products_ and _services_. The products world sells products; the services world handles service scheduling. Both worlds can be enabled together or individually, depending on the client's license (_APP_LICENSE_TYPE_).

## Tech Stack

- [Payload](https://payloadcms.com/docs/getting-started/what-is-payload) (CMS / backend)
- [Next.js](https://nextjs.org/docs) + [React Compiler](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [tailwindcss](https://tailwindcss.com/)
- [pnpm](https://pnpm.io/motivation) (package manager)

## Architecture

This project uses a **modular architecture** where each module contains all the logic and components associated with a specific business feature, promoting decoupling, reusability, and scalability. It is based on [Modular Architecture for Scalable Frontend Development](https://dev.to/amirrezasalimi/modular-architecture-for-scalable-frontend-development-2emb), adapted to Payload + Next.js.

### Key Principles

1. **Kebab-case Naming Convention**: use `kebab-case` for all directories and files. Use an extension that indicates the file type when applicable: `admin-only-field.access.ts`, `media.collection.ts`, `footer.component.tsx`, `available-slots.bl.ts`, `available-slots.uc.ts`, `bookings.model.ts`, `app.store.ts`, `date-formatter.util.ts`.

2. **Encapsulate Components in Directories**: each component lives in its own directory, even if it contains a single file. This keeps them isolated and ready to grow.

3. **Feature-based Modules**: the project is organized by features (modules). Each module contains its own components, business logic, use cases, collections, stores, etc.

4. **Shared Resources**: resources reusable by any module are centralized in [`src/shared/`](/src/shared/).

5. **Strict Module Boundaries**: a module may only access resources from `shared` or `infrastructure`. It must **never** reach into the internals of another module. `shared`/`infrastructure` must never import a module. When something is needed by ≥2 modules (or by `shared`/`infrastructure`), it must be relocated to `shared`/`infrastructure` — not imported across modules.

   **Exception — the composition roots.** Exactly two files (one per runtime) may import modules, because assembling independent modules into a running app is their entire job. They are pure, **unidirectional** dependency-injection sinks: they import modules, but no module ever imports them. Keep them thin (wiring only, no domain logic) and import only each module's public entry (its exported collection/provider/adapter), never internals:
   - **Client composition root:** [`src/shared/providers/app.provider.tsx`](/src/shared/providers/app.provider.tsx) — wires the app-wide provider tree (e.g. the Mercado Pago client provider).
   - **Server composition root:** [`src/payload.config.ts`](/src/payload.config.ts) and the plugin manifest it delegates to ([`src/infrastructure/plugins/`](/src/infrastructure/plugins/)) — Payload structurally requires a single config that registers every module's collections/globals/plugins.

   A composition root concentrating all module imports does **not** weaken module boundaries: the arrows point one way (app → modules), so no `module ↔ module` coupling is created and every module stays independently reasoned, tested, and portable.

6. **Business Logic and Use Cases**: all business-rule logic is encapsulated in `*.bl.ts` files that contain **pure TypeScript functions** with no pnpm package dependencies — they depend only on their arguments, which are [Payload types](/src/payload-types.ts) or types defined in `*.model.ts` files. The `*.uc.ts` files (use cases) consume those functions and are the integration point with Payload and other side effects. Examples: [slots logic](/src/modules/bookings/bl/available-slots.bl.ts) and [slots use case](/src/modules/bookings/uc/available-slots.uc.ts).

**Exception to principles 1 and 2:** files/directories tied to a specific technology may ignore these rules — for example the [App Router](/src/app/) (Next.js), the [payload config](/src/payload.config.ts), the design system components under [`src/shared/components/ui/`](/src/shared/components/ui/) (shadcn), and external-service integrations bound to a third-party SDK/contract such as the payment-method adapters under [`src/modules/checkout/payment-methods/`](/src/modules/checkout/payment-methods/) (e.g. the Mercado Pago adapter). These integrations still use clear typed suffixes (`.adapter.ts`, `.client.ts`, `.endpoint.ts`, `.handler.ts`, `.util.ts`) but are not split into `bl/`/`uc/`.

### Patterns

#### Container / Presentational

Separate UI from logic in components with state (state, context, side-effects).

- `*.component.tsx` (presentational): receives props, instantiates the component's main hook, and renders JSX. It must **not** contain logic outside the main hook.
- `use-<component-name>.ts` (hook): state, effects, handlers.

Does not apply to: [design system](/src/shared/components/ui/) and Next.js [routing files](https://nextjs.org/docs/app/getting-started/project-structure#routing-files).

#### Business Logic / Use Case

```
bl/  → pure functions, no pnpm deps, testable in isolation
uc/  → orchestrate bl + Payload Local API + side effects
```

Payload collections and endpoints must delegate business rules to `bl/` through `uc/`, not implement them inline in hooks or handlers.

**`uc/` is not a universal wrapper for `bl/`.** A `uc/` is specifically the adapter for **one side-effect boundary: Payload (Local API) on the server**. The hard invariant is that a `bl/` stays pure (no side effects, no knowledge of Payload or React); side effects always live in whatever orchestrator fits the surface that consumes the `bl/`:

- **Server — Payload hooks/endpoints:** consume `bl/` through a `uc/` (mandatory, as above).
- **Client — components:** the component's own hook (`use-<component>.ts`) is the client-side orchestrator (data fetching via SWR, form state, `toast`, etc.) and consumes `bl/` **directly**. Do **not** create a `uc/` for this — `uc/` implies a Payload coupling that does not exist client-side, and a passthrough adds indirection with no testability gain. If client orchestration becomes complex and shared, extract a shared hook (e.g. [`src/shared/hooks/`](/src/shared/hooks/)), still a hook — never `uc/`.
- **Other pure code:** may consume `bl/` directly (pure → pure).

**Error-signaling convention:** a `bl/` function signals a failed rule by throwing `new Error(undefined, { cause })` — no message, just a `cause` discriminator. `cause` is a **closed set of exactly two values**, shared by every `bl/` (do not invent rule-specific causes):

- `'incomplete'` — the data needed to evaluate the rule is missing or not yet available.
- `'invalid'` — the rule was evaluated and the document violates it.

A `bl/` never builds user-facing strings. The `uc/` wraps the `bl/` call in `try/catch`, maps `error.cause` to a message, and throws the Payload error appropriate to the surface:

- `ValidationError` when the rule guards an admin form field — the message **must** be translated via `req.t('custom:...')` because it renders in the admin UI. Example: [staff-assigned-to-store.uc.ts](/src/modules/bookings/uc/staff-assigned-to-store.uc.ts).
- `APIError` when the rule guards an API-only path — a plain (non-translated) message is fine because it surfaces only in the network response, not the admin UI. Example: [validate-address-location.uc.ts](/src/modules/shipping/uc/validate-address-location.uc.ts).

#### Client-side Data Fetching

All client-side requests **must** be made with [SWR](https://swr.vercel.app/) using a fetcher built on the native `fetch` API (no `axios` or other HTTP clients). The global configuration lives in [`src/infrastructure/swr/`](/src/infrastructure/swr/) and is applied through the app's provider tree. Do not call `fetch` directly inside components for data fetching — always go through `useSWR` (or `useSWRMutation`) so caching, deduplication, and revalidation behave consistently across the app.

#### Code Splitting

No component should exceed **300 lines**. If it exceeds that, split it into subcomponents.

#### Arrow Functions

Always prefer arrow functions when writing TypeScript functions.

#### No `useMemo` / `useCallback`

Do not use `useMemo` or `useCallback` in any component. The project uses [React Compiler](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler), which automatically memoizes components and values, making manual memoization unnecessary.

#### React Compiler + `react-hook-form` `formState`

`react-hook-form` subscribes to `formState` (`isDirty`, `isValid`, `dirtyFields`, `touchedFields`, `errors`, …) lazily, through a **Proxy whose getters are invoked while the component renders**. React Compiler assumes property reads are side-effect-free and memoizes them away, which can drop that subscription — the component then **stops re-rendering when the watched `formState` field changes mid-interaction**.

Add the `'use no memo'` directive as the **first statement of the consuming component** (not the hook — the re-render that gets skipped happens at the component level) when it reads a `formState` field that must update **on interaction**:

- `isDirty`, `isValid`, `dirtyFields`, `touchedFields` (change on every keystroke/change), or
- `errors` when the form uses `mode: 'onChange' | 'onTouched' | 'all'` (live, per-keystroke validation).

```tsx
export const AccountForm: React.FC = () => {
  'use no memo' // React Compiler breaks RHF's formState proxy subscription (here: isDirty)
  const { isDirty, register, ... } = useAccountForm()
  // ...
}
```

It is **not** needed for (these work unchanged under the compiler):

- `watch()` values — a different subscription mechanism (`_subjects.values`), not the `formState` proxy.
- `errors` in the default `mode: 'onSubmit'` — the re-render is driven by the submit handler, not a render-time read.
- `formState` fields that only matter at submit time (`isSubmitting`, `isLoading`), or submit state backed by `useState`/SWR.

Today only [account-form](/src/modules/account/components/account-form/account-form.component.client.tsx) qualifies (it reads `isDirty` to toggle the submit button). Keep the directive scoped to the specific component that needs it rather than applying it broadly, so the rest of the app keeps the compiler's optimizations.

### Directory Structure

```
📂 src/
├── 📂 app/                      # Next.js App Router (route groups: (app), (payload), (whatsapp))
│
├── 📂 infrastructure/           # Low-level cross-cutting resources
│   ├── 📂 access/               # admin-only-field.access.ts
│   ├── 📂 blocks/               # Reusable Payload block configs (content.config.ts)
│   ├── 📂 collections/          # Global collections (media.collection.ts)
│   ├── 📂 currencies/           # currencies.config.ts
│   ├── 📂 fields/               # Reusable field factories (address.field.ts)
│   ├── 📂 swr/                  # swr.fetcher.ts · swr.provider.client.tsx
│   ├── 📂 globals/              # configuration.global.ts
│   ├── 📂 header/ · footer/     # Globals + layout components
│   ├── 📂 i18n/                 # request.ts
│   ├── 📂 plugins/              # Payload plugins
│   ├── 📂 scripts/              # seed-pages.script.ts
│   ├── 📂 theme/                # theme.provider.client.tsx
│   └── features.ts              # World enablement by license
│
├── 📂 modules/                  # Business features (strict boundaries)
│   ├── 📂 bookings/             # "Services" world (scheduling)
│   │   ├── 📂 bl/               # available-slots.bl.ts  (pure functions)
│   │   ├── 📂 uc/               # available-slots.uc.ts   (use cases)
│   │   ├── 📂 models/           # bookings.model.ts
│   │   ├── 📂 constants/
│   │   ├── 📂 fields/
│   │   ├── 📂 collections/      # bookings/ · staff/ · stores/ (+ hooks/, endpoints/)
│   │   └── 📂 components/       # booking-form/ · service-gallery/ ...
│   ├── 📂 products/             # "Products" world (sales)
│   ├── 📂 checkout/ · cart/ · orders/ · shipping/
│   ├── 📂 account/ · auth/ · admin/ · pages/ · whatsapp/
│
└── 📂 shared/                   # Reusable by any module
    ├── 📂 components/           # ui/ (shadcn) + shared components
    ├── 📂 providers/
    ├── 📂 bl/                   # Shared pure logic (currency.bl.ts)
    ├── 📂 hooks/                # Reusable React hooks (use-supported-countries.ts)
    ├── 📂 utils/                # date-formatter.util.ts
    └── 📂 stores/ · constants/ · models/ · data/ · services/
```

### Layers

#### 1. Infrastructure

[`src/infrastructure/`](/src/infrastructure/) contains foundational cross-cutting resources: Payload configuration (globals, plugins, reusable fields and access), i18n, theming, and scripts. It does not represent a business feature.

#### 2. Modules

Each module in [`src/modules/`](/src/modules/) is a self-contained feature. Business logic lives in `bl/` (pure) and `uc/` (orchestration); the module's Payload collections live in `collections/` with their `hooks/` and `endpoints/`. Modules reflect the platform's two worlds (**products** and **services**) plus supporting features (checkout, cart, orders, auth, etc.).

#### 3. Shared

[`src/shared/`](/src/shared/) centralizes what is reusable across modules: design system (`components/ui/`, shadcn), shared components, providers, shared pure logic (`bl/`), reusable hooks (`hooks/`), utilities, stores, and global models. There is **no `domain/` folder** — pure business logic always lives in `bl/`, whether in a module or in `shared/`.

The most important rule is the **strict boundary between modules** and the isolation of **business logic in pure functions** (`bl/`), which makes it testable and portable independently of Payload or Next.js.

### Design System

- Prefer reusable components from the design system over creating your own: [shadcn/ui](https://ui.shadcn.com/docs) for the storefront and [payloadcms/ui](https://github.com/payloadcms/payload/tree/main/packages/ui) for the admin panel.
- Prefer tailwindcss classes over CSS files for styling.

### Package Manager

This project uses **pnpm**. Always run scripts with `pnpm` or `pnpx`, never `npm` or `npx`.

## Business Rules

Business rules of the _services_ world that the platform guarantees when a booking or a store is created or modified:

**Bookings:**

- A booking can only be scheduled for a service the chosen store actually offers.
- The assigned professional must offer the booked service.
- The assigned professional must be linked to the store where the booking is scheduled.
- If the booking is at-home, the professional must offer that type of service.
- A booking cannot overlap in date and time with another existing booking of the same professional.
- A booking cannot fall within a time block of the professional for that day of the week.
- The booking must occur on a working day of the professional and within their working hours (if they have no own schedule defined, the default schedule applies).

**Stores:**

- A store can only offer services that support the in-store (on-premises) modality.

## Commands

| Task | Command |
| --- | --- |
| Dev server | `pnpm dev` (Next.js + Payload at `http://localhost:3000`) |
| Production build | `pnpm build` |
| Lint | `pnpm lint` / `pnpm lint:fix` |
| Regenerate Payload types | `pnpm generate:types` (writes `src/payload-types.ts`) |
| Regenerate admin import map | `pnpm generate:importmap` |
| Integration tests | `pnpm test:int` (Vitest, jsdom, `tests/int/**/*.int.spec.ts`) |
| E2E tests | `pnpm test:e2e` (Playwright, `tests/e2e/`; auto-starts `pnpm dev`) |
| Full test suite | `pnpm test` (int then e2e) |
| Single integration test | `pnpm test:int -- -t "<test name>"` |
| Single E2E test | `pnpm test:e2e -- -g "<test name>"` |
| Seed CMS pages | `pnpm seed:pages` |

The database is **Vercel Postgres** via the Drizzle adapter (`@payloadcms/db-vercel-postgres`); collection/relationship IDs are `number`, not `string` (ignore the MongoDB URL in `.env.example`).

## Code Validation

- Before validating TypeScript, regenerate Payload types: `pnpm generate:types`
- To validate TypeScript correctness after modifying code, run `pnpm tsc --noEmit`
- Regenerate the import map (`pnpm generate:importmap`) after creating or modifying admin components.
