# Plan de Pruebas Manuales — Lado App (`src/app/(app)`)

Cobertura funcional completa del storefront para un *scan* de regresión. Las funcionalidades están agrupadas en **épicas → historias de usuario (HU)**, y cada historia referencia **casos de prueba (TC)** con ID único. Un TC nunca se repite: si una historia reutiliza un comportamiento ya cubierto, se referencia su TC en vez de duplicarlo.

## Convenciones

- **Feature flags** (`APP_LICENSE_TYPE` → `features.products` / `features.services`): muchas pruebas dependen de qué mundo está activo. Salvo que se indique lo contrario, ejecutar con **ambos activos**. Los TC marcados `[flag]` deben repetirse en las tres configuraciones: solo productos, solo servicios, ambos.
- **Roles**: `Invitado` (sin sesión), `Usuario` (cliente autenticado).
- Idioma por defecto según `next-intl`; ver TC-X02 para i18n.
- Resultado esperado = comportamiento correcto a verificar.

### Matriz de configuraciones de licencia

| Config | products | services |
|---|---|---|
| C1 | ✅ | ❌ |
| C2 | ❌ | ✅ |
| C3 | ✅ | ✅ |

---

## EPIC A — Navegación y contenido CMS

### HU-A1 — Como visitante quiero ver la home y las páginas de contenido
Cubre: `page.tsx`, `[slug]/page.tsx`. → TC-A01, TC-A02, TC-A03

### HU-A2 — Como visitante quiero ver una página de error 404 cuando la ruta no existe
Cubre: `not-found.tsx`. → TC-A04

### HU-A3 — Como visitante quiero recuperarme de un error de render sin perder la app
Cubre: `error.tsx`. → TC-A05

### HU-A4 — Como editor quiero previsualizar borradores (draft/live preview)
Cubre: `layout.tsx` (LivePreviewListener), `next/preview`, `next/exit-preview`. → TC-A06, TC-A07

| ID | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| TC-A01 | Existe página publicada con slug `home` | Navegar a `/` | Se renderiza hero + bloques de la página `home`; `<main>`, header y footer presentes |
| TC-A02 | Existe una página publicada con slug `X` | Navegar a `/X` | Se renderizan hero y bloques de esa página; metadata (title/description/OG) corresponde al doc |
| TC-A03 | Página existe solo como borrador (no publicada), sin draft mode | Navegar a `/X` | Devuelve 404 (no muestra borrador) |
| TC-A04 | — | Navegar a una ruta inexistente `/no-existe` | Página "404", texto de no encontrado y botón "Ir al inicio" que lleva a `/` |
| TC-A05 | — | Forzar un error de render en una página (p.ej. romper un fetch) | Se muestra el error boundary "Oops/storeError" con botón "Reintentar"; al pulsarlo, intenta re-renderizar |
| TC-A06 | Usuario admin editando un borrador en `/admin/...`, preview abierto en otra pestaña | **Guardar** el borrador en el admin | La pestaña de preview se actualiza automáticamente (vía `router.refresh()`) sin recarga dura del navegador y muestra el contenido recién guardado. Nota: la herramienta es *refresh-on-save* (`RefreshRouteOnSave`), no live preview reactivo por campo: cambios sin guardar **no** se reflejan |
| TC-A07 | Estar en draft mode (TC-A06) | Visitar `/next/exit-preview` | Se sale de draft mode; al recargar una página borrador vuelve a 404/publicado |

---

## EPIC B — Catálogo y tienda

### HU-B1 — Como visitante quiero explorar el catálogo en `/shop`
Cubre: `shop/page.tsx`, `shop/layout.tsx`, `shop/loading.tsx`. → TC-B01, TC-B02, TC-B03

### HU-B2 — Como visitante quiero buscar ítems por texto
→ TC-B04, TC-B05

### HU-B3 — Como visitante quiero filtrar por categoría
→ TC-B06

### HU-B4 — Como visitante quiero ordenar resultados
→ TC-B07

### HU-B5 — Como visitante quiero alternar entre productos y servicios `[flag]`
→ TC-B08, TC-B09

### HU-B6 — Como visitante quiero ver el detalle de un producto
Cubre: `products/[slug]/page.tsx`. → TC-B10, TC-B11, TC-B12, TC-B13

### HU-B7 — Como visitante quiero ver el detalle de un servicio
Cubre: `services/[slug]/page.tsx`. → TC-B14, TC-B15, TC-B16

| ID | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| TC-B01 | Hay ítems publicados | Ir a `/shop` | Grid responsivo de ítems (1/2/3 columnas); se muestra estado de carga (`loading.tsx`) durante la carga |
| TC-B02 | No hay ítems publicados del tipo activo | Ir a `/shop` | Mensaje "no hay ítems"; no se muestra grid |
| TC-B03 | Borrador no publicado existe | Ir a `/shop` | Los borradores no aparecen (solo `_status: published`) |
| TC-B04 | Hay ítems que coinciden con "abc" | Buscar `abc` en la barra de búsqueda | Texto "mostrando N resultado(s) para «abc»"; grid filtrado por título (like) |
| TC-B05 | Búsqueda sin coincidencias | Buscar `zzzzz` | Mensaje "ningún ítem coincide" + término entre comillas; sin grid |
| TC-B06 | Existen categorías con ítems | Seleccionar una categoría en el panel lateral | URL con `?category=`; grid filtrado por esa categoría |
| TC-B07 | Hay >1 ítem | Cambiar el orden en "Ordenar por" | URL con `?sort=`; orden de ítems cambia; sin selección, orden por `title` |
| TC-B08 | Config C3 (ambos) | En `/shop` cambiar el filtro de tipo a Servicios | Se muestran servicios; `?type=services`; filtro de tipo visible solo en C3 |
| TC-B09 | Config C1 o C2 | Ir a `/shop?type=services` (con solo productos) | Se fuerza el tipo del módulo activo, ignorando el query param; filtro de tipo oculto |
| TC-B10 | Producto publicado sin variantes, con stock | Ir a `/products/<slug>` | Galería, título, precio único, descripción (RichText), indicador de stock, botón "Agregar al carrito"; JSON-LD `Product` con `InStock` |
| TC-B11 | Producto con variantes | Ir a su detalle | Precio como rango (lowest/highest); selector de variantes presente |
| TC-B12 | Producto sin stock (inventory 0, no infinito) | Ir a su detalle | Indicador "sin stock"; JSON-LD `OutOfStock`; agregar al carrito deshabilitado (ver TC-C07) |
| TC-B13 | Producto inexistente o borrador sin draft | Ir a `/products/<slug-invalido>` | 404 |
| TC-B14 | Servicio publicado | Ir a `/services/<slug>` | Galería, título, precio, duración en min (si existe), descripción; JSON-LD `Service`; formulario de reserva presente |
| TC-B15 | Servicio inexistente o borrador sin draft | Ir a `/services/<slug-invalido>` | 404 |
| TC-B16 | `features.services=false` | Ir a `/services/<slug>` | 404 |
| TC-B17 | Producto con `relatedProducts` | Ir a su detalle | Sección "Productos relacionados" con enlaces a cada producto; sin relacionados, sección ausente |
| TC-B18 | Botón "volver" en detalle | Pulsar "Volver a productos/servicios" | Navega a `/shop?type=products` o `?type=services` según corresponda |

---

## EPIC C — Carrito (solo `features.products`)

### HU-C1 — Como visitante quiero agregar productos al carrito
Cubre: `add-to-cart`, `cart-modal`. → TC-C01, TC-C02

### HU-C2 — Como visitante quiero elegir la variante antes de agregar
Cubre: `variant-selector`. → TC-C03, TC-C04

### HU-C3 — Como visitante quiero ver/editar/vaciar el carrito
→ TC-C05, TC-C06

### HU-C4 — Como visitante quiero ver el stock disponible
→ TC-C07

| ID | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| TC-C01 | Producto con stock | En detalle pulsar "Agregar al carrito" | Toast "ítem agregado"; contador del carrito incrementa; abrir el cart modal muestra el ítem |
| TC-C02 | Ítem en carrito | Abrir el modal del carrito | Lista con imagen, título, precio, cantidad, subtotal y botón "Checkout" → `/checkout` |
| TC-C03 | Producto con variantes | Seleccionar una combinación de variante | URL con `?variant=`; precio/stock se actualizan a la variante |
| TC-C04 | Producto con variantes, sin variante seleccionada | Intentar agregar al carrito | Botón deshabilitado hasta seleccionar variante válida |
| TC-C05 | Carrito con ítem | Pulsar `+` y `-` en el modal | Cantidad y subtotal se recalculan; al llegar a 0 / botón borrar, el ítem se elimina |
| TC-C06 | Carrito vacío | Abrir el modal | Ícono carrito + mensaje "vacío"; sin botón checkout |
| TC-C07 | Producto sin stock | Ver detalle | "Agregar al carrito" deshabilitado; no se puede agregar |
| TC-C08 | Navegación | Con el modal abierto, cambiar de ruta | El modal del carrito se cierra automáticamente |

---

## EPIC D — Checkout y pagos (solo `features.products`)

### HU-D1 — Como comprador quiero finalizar la compra
Cubre: `checkout/page.tsx`, `checkout-page`. → TC-D01..TC-D07

### HU-D2 — Como comprador quiero confirmar el pago al volver de la pasarela
Cubre: `checkout/confirm-order/page.tsx`, `confirm-order`. → TC-D08..TC-D11

| ID | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| TC-D01 | `features.products=false` | Ir a `/checkout` | 404 |
| TC-D02 | Carrito vacío | Ir a `/checkout` | Estado de carrito vacío; no permite pagar |
| TC-D03 | Carrito con ítems, invitado | Ir a `/checkout` | Campo email editable obligatorio; al completarlo válido habilita continuar |
| TC-D04 | Usuario autenticado con direcciones | Ir a `/checkout` | Email precargado del usuario; primera dirección precargada como facturación |
| TC-D05 | Checkout en curso | Completar dirección de facturación; marcar/desmarcar "envío igual a facturación" | Con check, envío = facturación; sin check, se pide dirección de envío aparte; costo de envío se recalcula según país |
| TC-D06 | Solo MercadoPago habilitado | Verificar selección de método | Método preseleccionado automáticamente (único habilitado) |
| TC-D07 | MercadoPago habilitado, datos completos | Pulsar finalizar con método MercadoPago | Redirige a `init_point` (o `sandbox_init_point`) de MercadoPago; ante fallo, toast/mensaje "error de pago" |
| TC-D08 | WhatsApp habilitado con número | Pulsar finalizar con método WhatsApp | Abre `wa.me` en pestaña nueva con mensaje prearmado (saludo, cart id, cliente, email, direcciones) |
| TC-D09 | Sin email/usuario ni dirección ni método | Intentar finalizar | Acción de pago deshabilitada (`canPay=false`) |
| TC-D10 | Volver de MercadoPago con `?payment_id=` y carrito con ítems | Ir a `/checkout/confirm-order?payment_id=...` | Estado "confirmando"; al confirmar OK con `orderID` → redirige a `/orders/<id>?email=<email>` |
| TC-D11 | Pago pendiente | Volver con `payment_id` cuyo estado es pending | Estado "pendiente" mostrado, sin redirección |
| TC-D12 | Confirmación con error | `confirmOrder` falla | Estado "error" con mensaje (o "error desconocido") |
| TC-D13 | Sin `payment_id` en la URL | Ir a `/checkout/confirm-order` | Redirige a `/` |
| TC-D14 | Carrito vacío | Ir a `/checkout/confirm-order?payment_id=...` | No intenta confirmar (no hay ítems) |

---

## EPIC E — Autenticación y cuenta

### HU-E1 — Como visitante quiero iniciar sesión
Cubre: `login/page.tsx`, `login-form`. → TC-E01..TC-E04

### HU-E2 — Como visitante quiero crear una cuenta
Cubre: `create-account/page.tsx`, `create-account-form`. → TC-E05..TC-E08

### HU-E3 — Como visitante quiero recuperar mi contraseña
Cubre: `forgot-password/page.tsx`, `forgot-password-form`. → TC-E09, TC-E10

### HU-E4 — Como usuario quiero cerrar sesión
Cubre: `logout/page.tsx`, `LogoutPage`. → TC-E11, TC-E12

### HU-E5 — Como usuario quiero editar mis datos de cuenta
Cubre: `(account)/account/page.tsx`, `account-form`. → TC-E13..TC-E15

### HU-E6 — Como usuario quiero gestionar mis direcciones
Cubre: `(account)/account/addresses/page.tsx`, `address-listing`, `create-address-modal`. → TC-E16, TC-E17

### HU-E7 — Como sistema quiero proteger rutas privadas
Cubre: redirecciones en `(account)/*`, `orders`, `bookings`. → TC-E18, TC-E19

| ID | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| TC-E01 | Invitado | Ir a `/login`, enviar credenciales válidas | Inicia sesión; redirige a `redirect` param o `/account` |
| TC-E02 | Invitado | Login con credenciales inválidas | Mensaje "error de credenciales"; permanece en `/login` |
| TC-E03 | Usuario autenticado | Ir a `/login` | Redirige a `/account?warning=alreadyLoggedIn`; banner de warning visible |
| TC-E04 | Invitado | Enviar formulario con email/contraseña vacíos | Validaciones de campo requeridas (react-hook-form) impiden envío |
| TC-E05 | Invitado | Ir a `/create-account`, completar nombre/email/password/confirm coincidentes | Crea usuario, auto-login, redirige a `redirect` o `/account?success=accountCreatedSuccess` |
| TC-E06 | Invitado | Password y confirmación distintas | Error de validación de coincidencia; no se envía |
| TC-E07 | Email ya registrado | Crear cuenta con ese email | Mensaje de error (statusText/errorCreatingAccount); no crea |
| TC-E08 | Usuario autenticado | Ir a `/create-account` | Redirige a `/account?warning=alreadyLoggedIn` |
| TC-E09 | — | Ir a `/forgot-password`, enviar email válido | Estado de éxito mostrado; (correo de reset enviado) |
| TC-E10 | — | Forzar fallo del endpoint forgot-password | Mensaje de error; sin estado de éxito |
| TC-E11 | Usuario autenticado | Ir a `/logout` | Cierra sesión; mensaje de éxito + enlaces a tienda y `/login` |
| TC-E12 | Invitado (sin sesión) | Ir a `/logout` | Mensaje "ya habías cerrado sesión" |
| TC-E13 | Usuario autenticado | En `/account` editar nombre/email y guardar | Toast "actualizado"; datos persisten; formulario re-sincroniza |
| TC-E14 | Usuario autenticado | Activar "cambiar contraseña", ingresar nueva + confirmación | Se actualiza; tras guardar, modo cambio de contraseña se desactiva |
| TC-E15 | Usuario autenticado | Forzar fallo del PATCH de usuario | Toast "error al actualizar"; datos no cambian |
| TC-E16 | Usuario autenticado | Ir a `/account/addresses` | Lista de direcciones del usuario; botón/modal "crear dirección" |
| TC-E17 | Usuario autenticado | Crear una dirección desde el modal | La nueva dirección aparece en el listado |
| TC-E18 | Invitado | Ir a `/account`, `/account/addresses` | Redirige a `/login?warning=loginRequired` |
| TC-E19a | Usuario en `/account`; expirar/invalidar la cookie de sesión (p. ej. borrarla en DevTools) | Hard reload (`Cmd+R`) | Server guard de la página detecta ausencia de user y redirige a `/login?warning=loginRequired`. Nota: estando idle el cliente **no** redirige solo: el provider de auth no revalida (`/api/users/me` sin `refreshInterval` ni `revalidateOnFocus`) |
| TC-E19b | Igual que TC-E19a, sin recargar | Navegación soft a otra ruta protegida (`/account/addresses`, `/orders`, `/bookings`) | Server guard de esa ruta redirige a `/login?warning=loginRequired` |
| TC-E19c | Igual que TC-E19a | Editar el formulario de `/account` y pulsar guardar | El PATCH falla con 401/403 → se muestra toast "error al actualizar"; `user` **no** se setea a null, no redirige. *(Comportamiento a confirmar: el usuario queda atascado en la pantalla; reportar como bug si no es el esperado.)* |

---

## EPIC F — Pedidos (solo `features.products`)

### HU-F1 — Como usuario quiero ver mi historial de pedidos
Cubre: `(account)/account/page.tsx` (recientes), `(account)/orders/page.tsx`. → TC-F01, TC-F02

### HU-F2 — Como usuario quiero ver el detalle de un pedido
Cubre: `(account)/orders/[id]/page.tsx`. → TC-F03, TC-F04

### HU-F3 — Como invitado quiero localizar un pedido por nº y email
Cubre: `find-order/page.tsx`, `find-order-form`. → TC-F05, TC-F06, TC-F07

| ID | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| TC-F01 | Usuario con pedidos | Ir a `/account` | Bloque "pedidos recientes" (máx 5) + enlace "ver todos" → `/orders`; sin pedidos, mensaje "no hay pedidos" |
| TC-F02 | Usuario con/sin pedidos | Ir a `/orders` | Lista completa de pedidos del usuario u "no hay pedidos"; `features.products=false` → 404 |
| TC-F03 | Usuario, pedido propio | Ir a `/orders/<id>` | Detalle: nº, fecha, total, estado, ítems (producto/variante/cantidad), dirección de envío; botón "volver a pedidos" |
| TC-F04 | Usuario | Ir a `/orders/<id>` de pedido ajeno | 404 (no autorizado) |
| TC-F05 | Invitado | Ir a `/find-order`, enviar nº de orden + email | Redirige a `/orders/<id>?email=<email>` |
| TC-F06 | Invitado, email coincide con `customerEmail` del pedido | Acceder a `/orders/<id>?email=...` | Detalle visible como invitado (sin botón "volver a pedidos") |
| TC-F07 | Invitado, email no coincide | `/orders/<id>?email=incorrecto` | 404 |
| TC-F08 | `features.products=false` | Ir a `/find-order` | 404 |
| TC-F09 | Pedido con ítem cuyo producto fue borrado | Ver detalle | Se muestra "ítem no disponible" sin romper la página |

---

## EPIC G — Reservas / servicios (solo `features.services`)

### HU-G1 — Como usuario quiero ver mis reservas
Cubre: `(account)/account/page.tsx` (próximas), `(account)/bookings/page.tsx`. → TC-G01, TC-G02

### HU-G2 — Como usuario quiero ver el detalle de una reserva
Cubre: `(account)/bookings/[id]/page.tsx`. → TC-G03, TC-G04

### HU-G3 — Como usuario quiero reservar un servicio
Cubre: `booking-form`. → TC-G05..TC-G10

### HU-G4 — Como visitante quiero contactar por WhatsApp servicios marcados
Cubre: `service-description` (redirectToWhatsApp). → TC-G11

| ID | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| TC-G01 | Usuario con reservas futuras | Ir a `/account` | Bloque "próximas reservas" (máx 5, ordenadas por fecha, futuras) + enlace "ver todas" |
| TC-G02 | Usuario | Ir a `/bookings` | Lista de todas sus reservas u "no hay reservas"; `features.services=false` → 404 |
| TC-G03 | Usuario, reserva propia | Ir a `/bookings/<id>` | Detalle: nº, fecha/hora, servicio, staff, ubicación (tienda si `inStore`, dirección si `delivery`); botón "volver" |
| TC-G04 | Usuario | `/bookings/<id>` de reserva ajena o inexistente | 404 |
| TC-G05 | Invitado | Abrir formulario de reserva en detalle de servicio | Se indica que debe autenticarse para reservar (no permite enviar) |
| TC-G06 | Usuario, servicio con 1 modalidad/tienda/staff | Abrir formulario | Modalidad/tienda/staff con opción única se auto-seleccionan |
| TC-G07 | Usuario, modalidad `inStore` | Elegir modalidad → tienda → staff → fecha → hora | Cada cambio resetea los pasos siguientes; al cambiar staff se recargan slots |
| TC-G08 | Usuario, modalidad `delivery` | Elegir modalidad delivery sin dirección | No avanza hasta proveer dirección; con dirección, lista de staff disponible |
| TC-G09 | Usuario, fecha con bloqueos / día no laborable | Abrir el calendario | Fechas deshabilitadas (`isDateDisabled`) no son seleccionables |
| TC-G10 | Usuario, todos los campos válidos | Enviar la reserva | Toast "confirmada"; formulario se resetea; reserva aparece en `/bookings`. Ante error del API: toast con mensaje del error/"falló" |
| TC-G11 | Servicio con `redirectToWhatsApp` y número configurado | Ver detalle del servicio | Se muestra botón de WhatsApp en lugar del formulario de reserva (ver TC-H05) |

---

## EPIC I — Integración MercadoPago Checkout Pro (solo `features.products`)

Cubre la capa servidor/admin/webhook del adaptador MP. Los casos centrados en el *flujo de UI* (selección del método, redirect a `init_point`, pantalla de confirm-order) ya están en EPIC D — aquí se verifican invariantes que no son observables solo desde el storefront. Para descubrir referencias del código ver [docs/MERCADOPAGO-INTEGRATION-AUDIT.md](MERCADOPAGO-INTEGRATION-AUDIT.md).

**Mecanismos de ejecución:**

- **Inspección de preferencia:** tras un checkout, anotar `transaction.mercadopago.preferenceId` desde el admin y consultarla con `GET https://api.mercadopago.com/checkout/preferences/{id}` con `Authorization: Bearer $MERCADOPAGO_ACCESS_TOKEN`, o ver la preferencia en *Tus integraciones → Actividad*.
- **Webhooks:** simular desde el panel MP (*Webhooks → Simular notificación*), o disparar manualmente con `curl` calculando la firma con la fórmula `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` y HMAC-SHA256 con `MERCADOPAGO_WEBHOOK_SECRET`. Para dev local se necesita un túnel público (p.ej. ngrok) apuntando a `/api/payments/mercadopago/webhooks`.
- **DB:** verificar `transactions`, `orders`, `carts` desde el admin o `psql` directo.
- **Credenciales sandbox** (`APP_USR-...` con token de test) y **producción** producen `sandbox_init_point` o `init_point` respectivamente.

### HU-I1 — Como sistema quiero generar preferencias MP bien formadas
Cubre: `initiate-payment.handler.ts`. → TC-I01..TC-I10

### HU-I2 — Como sistema quiero persistir y limpiar la transacción correctamente
Cubre: `initiate-payment.handler.ts`, `transactions.collection.ts`. → TC-I11..TC-I13

### HU-I3 — Como sistema quiero validar la firma del webhook MP
Cubre: `webhook.endpoint.ts` (`verifyWebhookSignature`). → TC-I14..TC-I17

### HU-I4 — Como sistema quiero reconciliar pagos vía webhook
Cubre: `webhook.endpoint.ts` (`handlePaymentWebhook`), `create-order-from-payment.handler.ts`. → TC-I18..TC-I24

### HU-I5 — Como sistema quiero `confirmOrder` reconcile en sincrónico
Cubre: `confirm-order.handler.ts`. → TC-I25, TC-I26

### HU-I6 — Como admin quiero auditar la transacción y la orden
Cubre: admin panel sobre `transactions` y `orders`. → TC-I27..TC-I29

### HU-I7 — Como sistema quiero fallar limpio sin credenciales / endpoints retirados
Cubre: validaciones de `accessToken`/`webhookSecret`, retiro de `webhookGetEndpoint`. → TC-I30..TC-I32

| ID | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| TC-I01 | Carrito con ≥2 ítems distintos (idealmente uno con variante) | Hacer checkout y consultar la preferencia creada en MP | `items[]` tiene **una entrada por línea del carrito** (no una agregada "Order"); cada item lleva `title` igual al `product.title` (con `(variant.title)` si aplica), `id` `<productId>` o `<productId>-<variantId>`, `quantity` y `unit_price` que respetan la regla "variante sobrescribe producto"; `currency_id` en mayúsculas |
| TC-I02 | Checkout con costo de envío > 0 | Inspeccionar `items[]` de la preferencia | Aparece una línea extra con `id: 'shipping'`, `title: 'Envío'`, `quantity: 1`, `unit_price = shippingCost`; suma de `unit_price*quantity` = `transaction.amount` |
| TC-I03 | Cualquier checkout exitoso | Comparar `preference.external_reference` vs `transaction.id` del registro recién creado | Coinciden exactamente; `external_reference` es `String(transaction.id)` |
| TC-I04 | Cualquier checkout exitoso | Inspeccionar la preferencia | `back_urls.success` y `.pending` = `${serverURL}/checkout/confirm-order`; `back_urls.failure` = `${serverURL}/checkout`; `notification_url` = `${serverURL}/api/payments/mercadopago/webhooks` |
| TC-I05 | a) `serverURL` http (dev local); b) `serverURL` https (deploy) | Inspeccionar dos preferencias en cada ambiente | (a) `auto_return` ausente en el body; (b) `auto_return: 'approved'`. Razón documentada: MP rechaza preferencias con `auto_return` cuando `back_urls.success` no es HTTPS |
| TC-I06 | Checkout en momento `T` | Inspeccionar `expiration_date_from`/`_to` | `_from` ≈ `T` (ISO con `Z`); `_to` ≈ `T + 24h`. La preferencia debe expirar tras 24h en sandbox (intentar pagar pasado ese plazo: MP la rechaza) |
| TC-I07 | Checkout con `billingAddress` completa (`name="Juan Pérez Lopez"`, `phone`, `addressLine1`, `postalCode`) | Inspeccionar `preference.payer` | `email` = customerEmail; `name` = `"Juan"`; `surname` = `"Pérez Lopez"`; `phone.number` = el del billing; `address.street_name` = `addressLine1`; `address.zip_code` = `postalCode`. Si falta `billingAddress`, solo `email` |
| TC-I08 | `COMPANY_NAME` env = `"ZOREN CONSULTORA S.A.S."` (25 chars) | Inspeccionar `preference.statement_descriptor` | Valor truncado a 22 chars: `"ZOREN CONSULTORA S.A.S"`. Si `COMPANY_NAME` no está seteado, el campo se omite |
| TC-I09 | Cualquier checkout exitoso | Inspeccionar `preference.binary_mode` | `false`. Pagos PSE/Efecty deben quedar `in_process` y no rechazarse al toque |
| TC-I10 | Disparar dos `initiatePayment` con el mismo carrito sin completar la primera (p. ej. doble-click en finalizar) | Comparar las dos preferencias devueltas | Solo se crea **una** preferencia (mismo `id`); MP de-duplica por `idempotencyKey = transaction-<id>`. No deben existir dos transacciones en `pending` con la misma cart |
| TC-I11 | Checkout que llega a `payload.create({ collection: 'transactions' })` | Inspeccionar el registro de Transaction en admin | Campos: `status='pending'`, `paymentMethod='mercadopago'`, `customer` (si auth) o vacío (guest), `customerEmail`, `amount` = subtotal+envío, `currency`, `cart` enlazado, `items` (snapshot), `billingAddress` (group), `shippingAddress` (group, **nuevo**, todos los subcampos requeridos están llenos porque el path MP los valida upstream), `shippingCost` (sidebar, **nuevo**). Inmediatamente después de crear la preferencia: `mercadopago.preferenceId` poblado |
| TC-I12 | Después de TC-I11 | Confirmar que `transaction.mercadopago.preferenceId` se actualizó en una segunda escritura post-preferencia | El valor coincide con `preference.id` de MP |
| TC-I13 | Forzar fallo del SDK MP (p. ej. token inválido temporal) | Iniciar checkout | El handler hace `payload.delete` de la transacción recién creada; la base no queda con un `pending` huérfano. El frontend muestra toast/`paymentError` |
| TC-I14 | Webhook POST con `data.id`, `x-signature` y `x-request-id` correctos, secret coincide | Disparar el POST contra `/api/payments/mercadopago/webhooks?type=payment&data.id=<id>` | Respuesta 200; logs incluyen `manifest=id:<id>;request-id:<rid>;ts:<ts>;` y el SHA calculado coincide con `v1`. Se sigue al paso 2 (fetch del payment en MP) |
| TC-I15 | Mismo POST con `v1` adulterado (un byte) | Disparar el POST | Respuesta **200** con `{success:false, message:'Invalid signature'}`; log a nivel `warn`; **MP no debe reintentar**. No se crea Order, no se modifica Transaction |
| TC-I16 | a) sin `x-signature`; b) sin `x-request-id`; c) sin `data.id` query param | Disparar los 3 POST | Cada uno responde **400** con mensaje correspondiente (`Missing headers`, `Missing data.id`); no procesa |
| TC-I17 | POST con `?type=merchant_order` (firma válida, payload real) | Disparar el POST | 200 `{message:'OK'}` sin procesar; no toca DB |
| TC-I18 | Transaction `pending` existe; webhook entrega un `payment` real con `status=approved` y `transaction_amount === transaction.amount` | Disparar el webhook firmado | Order creada con `status='processing'`, `shippingAddress`/`shippingCost`/`items` heredados de la Transaction, `customerEmail` desde `payer.email` (fallback `transaction.customerEmail`), `amount`/`currency` desde el payment; Transaction → `status='succeeded'`, `mercadopago.paymentId` poblado; Cart → `purchasedAt` seteado; respuesta 200 |
| TC-I19 | Transaction `pending` con `amount=100000`; webhook entrega payment `approved` con `transaction_amount=50000` | Disparar el webhook | Transaction → `status='failed'`, `mercadopago.paymentId` poblado; **no** se crea Order; respuesta 200 con `Payment amount mismatch`; log a `error` con `expected` y `received` |
| TC-I20 | Transaction `pending`; webhook entrega payment `rejected` | Disparar el webhook | Transaction → `status='failed'`; sin Order; respuesta 200 `Payment rejected` |
| TC-I21 | Transaction `pending`; webhook entrega payment `pending` o `in_process` | Disparar el webhook | Sin cambios en Transaction (sigue `pending`); sin Order; respuesta 200 `Payment status: pending` (o `in_process`); log informativo |
| TC-I22 | Casos: (a) `payment.get` devuelve null/404 en MP; (b) payment sin `external_reference`; (c) `external_reference` apunta a una transaction inexistente | Disparar cada webhook firmado | Los tres responden **200** (no 5xx) con su mensaje correspondiente y un `warn` log; MP no reintenta. Esto evita retries infinitos cada 15 min ante eventos huérfanos |
| TC-I23 | Transaction ya en `status='succeeded'` por una entrega previa | Re-entregar el mismo webhook (botón "reenviar" en MP) | Respuesta 200 `Already processed: succeeded`; no se crea Order duplicada; Cart no se vuelve a tocar |
| TC-I24 | Transaction `pending`; el cliente regresa a `/checkout/confirm-order?payment_id=...` **al mismo tiempo** que MP envía el webhook | Provocar la carrera (delay artificial en uno de los dos o ejecutar en paralelo) | Solo se crea **una** Order (constraint `unique` sobre `orders.transaction` protege); el segundo caller recibe el path "ya creada por proceso concurrente" sin error visible; respuesta 200/exitosa al usuario y 200 al webhook |
| TC-I25 | Transaction `pending`; payment MP `approved`; usuario llega al `/checkout/confirm-order?payment_id=...` antes de que llegue el webhook | Disparar la llamada al endpoint `confirm-order` (vía UI o curl) | Crea Order, Transaction → `succeeded`, Cart → `purchasedAt`; respuesta incluye `orderID` y `email`. Es el mismo efecto que TC-I18 pero ejecutado por el cliente |
| TC-I26 | Transaction ya `succeeded` (orden ya creada por webhook); recargar `/checkout/confirm-order?payment_id=...` | Esperar la llamada del cliente | Devuelve `orderID` existente sin crear una segunda; idempotente. No lanza error |
| TC-I27 | Tras TC-I18 o TC-I25 | Entrar al admin → Transactions → abrir el registro | Visible: tab "Detalles" con `paymentMethod=mercadopago` y group `mercadopago` con `preferenceId` + `paymentId`; tab "Facturación" con `billingAddress`; group `shippingAddress` y sidebar `shippingCost` poblados; `customer`/`customerEmail`/`amount`/`currency`/`status`/`order` correctos |
| TC-I28 | Tras TC-I18 | Admin → Orders → abrir el registro | Order tiene `transaction` enlazada (sidebar, read-only); editar e intentar guardar otra Order con la **misma** Transaction debe fallar con error de constraint único |
| TC-I29 | Transaction succeeded existe | Admin → editar la Transaction y subir una imagen al campo `receipt` | El upload de Media se guarda y aparece en el registro; sirve como respaldo manual del comprobante MP |
| TC-I29b | Admin autenticado | Admin → Transactions → crear nueva con `paymentMethod`, `amount`, `currency`, `customerEmail`, **sin tocar `billingAddress`, `shippingAddress` ni `shippingCost`** | El registro se guarda sin errores de validación. Útil para registrar pagos manuales (transferencia, efectivo) donde no aplica un envío logístico. Si luego se intenta promover esa Transaction a Order vía hooks customizados, la validación de Order (que sí requiere `shippingAddress.name/addressLine1/city/country`) la rechazará — lo cual es el comportamiento deseado |
| TC-I30 | `MERCADOPAGO_ACCESS_TOKEN` ausente del entorno | Reiniciar dev server e intentar checkout MP | `initiatePayment` lanza `Mercado Pago access token is required.`; UI muestra `paymentError` |
| TC-I31 | `MERCADOPAGO_WEBHOOK_SECRET` ausente del entorno | Reiniciar y enviar webhook firmado | `verifyWebhookSignature` recibe `secret=""`; firma nunca coincide → 200 silencioso vía TC-I15. Adicionalmente cualquier `initiatePayment` lanza `Mercado Pago webhook secret is required.` (validado en el handler de checkout, no en el webhook) |
| TC-I32 | — | `GET /api/payments/mercadopago/webhooks` con curl | 404/405: el endpoint GET fue retirado (no debe responder `Mercado Pago webhook endpoint is active`) |

---

## EPIC H — Transversal

### HU-H1 — Como negocio quiero que la licencia controle qué mundos se muestran `[flag]`
→ TC-H01

### HU-H2 — Como visitante quiero la app en mi idioma
→ TC-H02

### HU-H3 — Como negocio quiero aplicar el tema configurado
→ TC-H03

### HU-H4 — Como visitante quiero navegar por header, footer y menú móvil
Cubre: `layout.tsx`, header/footer/mobile-menu. → TC-H04, TC-H06

### HU-H5 — Como visitante quiero comprar/consultar vía WhatsApp ítems marcados
Cubre: `whatsapp-button` en producto/servicio. → TC-H05

### HU-H6 — Como visitante quiero ver banners de aviso/éxito/error por query params
Cubre: `render-params`. → TC-H07

### HU-H7 — Como negocio quiero SEO correcto (metadata, OG, robots, JSON-LD)
→ TC-H08

| ID | Precondición | Pasos | Resultado esperado |
|---|---|---|---|
| TC-H01 | Cada config C1/C2/C3 | Recorrer header, `/shop`, rutas `/orders`, `/bookings`, `/checkout`, `/find-order` | Productos: rutas/UI de servicios devuelven 404/ocultas; servicios: rutas/UI de productos 404/ocultas; ambos: todo disponible y filtro de tipo visible |
| TC-H02 | Locale `es` y `en` | Cambiar idioma / `getLocale` | Todos los textos visibles traducidos; `<html lang>` correcto; sin claves crudas |
| TC-H03 | `THEME` env configurado (p.ej. dark) y sin configurar | Cargar cualquier página | `<html data-theme>` = THEME o `light` por defecto; estilos del tema aplicados |
| TC-H04 | — | Revisar header en todas las páginas | Header presente; carrito visible solo si `features.products`; enlaces de navegación funcionan; estado activo según pathname |
| TC-H05 | Producto/servicio con `redirectToWhatsApp` + número | Pulsar botón WhatsApp | Abre chat de WhatsApp con mensaje del ítem; reemplaza add-to-cart / booking form |
| TC-H06 | Viewport móvil | Abrir menú móvil | Menú móvil abre/cierra; enlaces navegan y cierran el menú; footer visible |
| TC-H07 | URL con `?warning=`, `?success=`, `?error=` | Visitar `/login`, `/account`, `/create-account` | Banner correspondiente renderizado con el texto del param |
| TC-H08 | Páginas de página/producto/servicio | Inspeccionar `<head>` y JSON-LD | title/description/OG correctos; `robots index/follow` = (`_status==='published'`); JSON-LD `Product`/`Service` válido con precio/moneda/disponibilidad |

---

## Resumen de cobertura

| Épica | HU | TCs | Dependencia de flag |
|---|---|---|---|
| A — Contenido CMS | 4 | TC-A01–A07 | No |
| B — Catálogo | 7 | TC-B01–B18 | Parcial (B08/B09/B16) |
| C — Carrito | 4 | TC-C01–C08 | products |
| D — Checkout/pagos (UI) | 2 | TC-D01–D14 | products |
| E — Auth/cuenta | 7 | TC-E01–E18, TC-E19a/b/c | No |
| F — Pedidos | 3 | TC-F01–F09 | products |
| G — Reservas | 4 | TC-G01–G11 | services |
| H — Transversal | 7 | TC-H01–H08 | C1/C2/C3 |
| I — MercadoPago (server/webhook/admin) | 7 | TC-I01–I32 | products |

**Total: 45 historias de usuario, 124 casos de prueba únicos** (sin duplicados; los comportamientos compartidos se referencian entre historias).

### Orden de ejecución sugerido para el scan
1. EPIC H (transversal, valida flags/i18n/tema base).
2. EPIC A + B (navegación y catálogo, sin sesión).
3. EPIC E (auth) — habilita usuario para el resto.
4. EPIC C → D (flujo de compra completo, requiere `products`).
5. EPIC I (MercadoPago server/webhook, depende de D: necesita un checkout finalizado para inspeccionar preferencias y disparar webhooks).
6. EPIC F (pedidos, depende de D/I).
7. EPIC G (reservas, requiere `services` + usuario).
</content>
</invoke>
