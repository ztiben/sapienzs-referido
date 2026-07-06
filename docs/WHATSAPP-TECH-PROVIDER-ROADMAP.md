# WhatsApp Tech Provider — Roadmap Zoren.io

> Estado: hito 1 (webhook seguro + bienvenida) completado. Este documento define el camino
> para que Zoren opere como **Tech Provider de Meta**: los clientes de Zoren conectan su
> propio WhatsApp Business (WABA) vía **Embedded Signup** y envían mensajes a sus clientes
> finales a través de la Cloud API, sin tocar nada técnico.

## Modelo elegido

- **Una sola app de Meta** (propiedad de Zoren) sirve a todos los clientes.
- Cada cliente conecta/crea su **WABA + número** desde el admin de su tienda mediante el
  popup oficial de Embedded Signup.
- Casos de uso habilitados: bot de respuestas (ventana 24 h), notificaciones
  transaccionales (plantillas de utilidad) y campañas de marketing (plantillas de marketing).

## Vía 1 — Cuentas y verificaciones en Meta (manual, iniciar YA)

La verificación de negocio es el cuello de botella (días a semanas). Orden recomendado:

1. **Portafolio de negocio de Zoren** en [business.facebook.com](https://business.facebook.com)
   con los datos legales reales (razón social, dominio zoren.io, email corporativo).
2. **Verificación del negocio**: *Centro de seguridad → Iniciar verificación*. Documentos:
   constancia legal de la empresa, comprobante de domicilio, teléfono/dominio verificable.
   ⏳ *Iniciar esto primero; todo lo demás puede avanzar en paralelo.*
3. **App de Meta** en [developers.facebook.com](https://developers.facebook.com):
   tipo *Business*, producto *WhatsApp*, asociada al portafolio de Zoren.
   (Ya existe una app de pruebas del hito 1 — evaluar si se reutiliza o se crea la definitiva.)
4. **Registro como Tech Provider**: seguir el flujo "Become a Tech Provider" dentro del
   producto WhatsApp de la app.
5. **Acceso avanzado (App Review)** para los permisos:
   - `whatsapp_business_messaging` (enviar/recibir mensajes en nombre de clientes)
   - `whatsapp_business_management` (gestionar WABAs, plantillas, números)
   Requiere: verificación de negocio aprobada + screencast demostrando la integración.
6. **Configurar Embedded Signup**: producto *Facebook Login for Business* → crear una
   *Configuration* (genera el `config_id` que usa el popup) → dominios permitidos.
7. **Webhook a nivel app**: URL de producción + verify token + suscripción al campo
   `messages` (el endpoint del hito 1 ya lo soporta).

### Mientras tanto (sin esperar verificación)

- El **número de prueba** de la app permite desarrollar y probar todo el flujo de
  mensajería (hasta 5 destinatarios de prueba) sin App Review.
- Renovar el token temporal expirado y agregar `WHATSAPP_APP_SECRET` al `.env`
  (ver `.env.example`).

## Vía 2 — Hitos de código (en paralelo)

| Hito | Alcance | Depende de |
|---|---|---|
| ~~1~~ ✅ | Webhook seguro (firma HMAC + dedup) + respuesta de bienvenida | — |
| 2 | **Fundaciones multi-tenant**: colección Payload `whatsapp-accounts` (WABA ID, phone_number_id, token cifrado, estado), dedup persistente, log de conversaciones en admin | Nada de Meta |
| 3 | **Embedded Signup** en el admin: botón "Conectar WhatsApp" → popup Meta → intercambio del `code` por token de integración → persistir credenciales | Pasos 5-6 de Vía 1 |
| 4 | **Bot de respuestas** (rediseño de los flujos del código legacy `src/modules/whatsapp/services/`, con `bl/`/`uc/`): catálogo, agendar/cancelar citas, estado de pedido | Hito 2 |
| 5 | **Plantillas**: gestión/registro de plantillas de utilidad (confirmaciones, recordatorios) y envío transaccional desde hooks de bookings/orders | Hitos 2-3 |
| 6 | **Campañas de marketing**: audiencias, envío masivo con throttling, opt-out obligatorio, métricas de entrega | Hito 5 |
| 7 | Limpieza: borrar `src/modules/whatsapp/services/` (legacy comentado) | Hito 4 |

## Notas de arquitectura multi-tenant

- **Un deployment por cliente** (modelo actual de Zoren) + **una app de Meta**: Meta
  entrega los webhooks de todas las WABAs a la URL configurada en la app, **pero permite
  sobrescribir la callback URL por WABA** (*alternate callback URL*). Al onboardear un
  cliente, se configura el override apuntando a `https://<dominio-del-cliente>/whatsapp`.
  Así cada deployment solo recibe los mensajes de su propio número. Plan B: un hub central
  de Zoren que enrute por `metadata.phone_number_id`.
- **Credenciales por cliente en BD, no en `.env`**: el token de integración (business
  integration system user token) obtenido en Embedded Signup se guarda cifrado en la
  colección `whatsapp-accounts`. Las env vars quedan solo para el App ID/Secret de Zoren.
- **El `phone_number_id` del payload entrante** es la llave de enrutamiento y de matching
  contra `whatsapp-accounts`.
- **Firma de webhooks**: se sigue verificando con el App Secret de Zoren (una sola app →
  un solo secret), sin cambios respecto al hito 1.

## Costos de Meta (comunicar a los clientes)

- **Conversaciones de servicio** (el cliente final escribe primero, respuesta en ≤24 h):
  sin costo o costo mínimo — es el caso del bot de respuestas.
- **Plantillas de utilidad** (confirmaciones, recordatorios): se cobra por mensaje, tarifa baja.
- **Plantillas de marketing**: la tarifa más alta por mensaje; el envío masivo exige
  opt-in del destinatario y castiga el spam con bloqueo del número (quality rating).
- Cada cliente paga su consumo con el método de pago de **su** WABA (Zoren no intermedia
  la facturación salvo que escale a Solution Partner).
- Un número **no puede** estar simultáneamente en la app de WhatsApp/WhatsApp Business y
  en la Cloud API; los números en uso requieren migración.
