# Sapyenzs Referido

Sitio de **ofertas curadas con enlaces de afiliado** (Amazon, Mercado Libre, Éxito) construido con Payload CMS 3 + Next.js 15, bilingüe (español/inglés) y desplegado en Vercel.

Basado en la infraestructura y arquitectura modular de la plataforma Zoren. Consulta [CLAUDE.md](./CLAUDE.md) para la guía completa de arquitectura, dominio y convenciones.

## Características

- **Catálogo de ofertas** curado desde el panel de Payload (`/admin`): precios original/oferta, % de descuento, vencimiento, destacadas.
- **Tiendas como contenido**: cada retailer es una fila del CMS con su plantilla de enlace de afiliado (`{url}?tag=...`) — agregar una tienda no requiere código.
- **Redirect de afiliado** `/go/[dealId]`: aplica la plantilla del retailer, cuenta clics y redirige con `rel="sponsored nofollow"`.
- **Búsqueda y filtros** en `/deals` (texto, tienda, categoría, paginación).
- **Cuentas de usuario**: favoritos y reporte de ofertas vencidas.
- **Newsletter** con endpoint público idempotente (`POST /api/subscribers/subscribe`).
- **Bilingüe**: next-intl (UI) + localización de Payload (contenido, ES por defecto).
- **Preparado para importación por API** (grupo `sync` en las ofertas: source, externalId, lastSyncedAt).

## Desarrollo local

Requisitos: Node 20+, pnpm, y una base de datos Postgres (recomendado: [Neon](https://neon.tech) gratis).

```bash
cp .env.example .env    # completa POSTGRES_URL y PAYLOAD_SECRET
pnpm ii                 # instalar dependencias
pnpm dev                # http://localhost:3000  (admin en /admin)
```

Primer arranque:

1. Abre `http://localhost:3000/admin` y crea el primer usuario (se vuelve admin automáticamente).
2. `pnpm seed:retailers` — crea Amazon, Mercado Libre y Éxito (edita las plantillas de afiliado con tus tags reales).
3. `pnpm seed:pages` — crea las páginas legales (divulgación de afiliados, privacidad, acerca de).
4. Crea ofertas en **Catálogo → Ofertas** y márcalas como destacadas para verlas en la home.

## Comandos

| Tarea | Comando |
| --- | --- |
| Dev server | `pnpm dev` |
| Build de producción | `pnpm build` |
| Lint | `pnpm lint` |
| Tipos de Payload | `pnpm generate:types` |
| Import map del admin | `pnpm generate:importmap` |
| Tests de integración | `pnpm test:int` |
| Tests E2E (Playwright) | `pnpm test:e2e` |
| Seeds | `pnpm seed:pages` · `pnpm seed:retailers` |

## Despliegue en Vercel

1. Sube el repo a GitHub y crea un proyecto nuevo en Vercel importándolo (pnpm se detecta por el lockfile).
2. En la pestaña **Storage** del proyecto: crea una base **Neon Postgres** (inyecta `POSTGRES_URL`) y un **Blob store** (inyecta `BLOB_READ_WRITE_TOKEN`).
3. Configura las variables de entorno restantes (ver `.env.example`): `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL` y `PAYLOAD_PUBLIC_SERVER_URL` (dominio de producción), `PREVIEW_SECRET`, `SITE_NAME`, `COMPANY_NAME`.
4. Despliega, entra a `/admin`, crea el primer usuario admin y corre los seeds apuntando a la base de producción.

## Cumplimiento de afiliados

- La página **/divulgacion-afiliados** es obligatoria para Amazon Associates y está enlazada en el footer.
- Todos los CTAs salientes llevan `rel="sponsored nofollow"`.
- Reemplaza los placeholders de `affiliateTagTemplate` de cada retailer por tus tags reales antes de publicar.
