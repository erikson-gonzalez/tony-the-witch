# Preguntas para soporte ONVO — solo si bloqueado

**Status:** NOT SENT. 2026-04-27 decision: build + test empirically first; consult support only if a question genuinely blocks implementation.

**Why not send proactively:** every question below is either (a) testable in sandbox, (b) discoverable on first real transaction, or (c) moot until an edge case actually occurs. Asking pre-launch is premature — ONVO support would likely respond "have you tested it?" first.

**When to send:** if and only if an empirical test reveals something we cannot resolve from observed behavior (e.g., ONVO rejects USD intent on CR card with a 4xx error code we can't decode). Send only the relevant subset, not the full list.

---

## Reference cover note (use only if sending)

> Hola, equipo ONVO 👋
>
> Estamos integrando ONVO Pay (Embedded SDK + webhooks, solo tarjetas) en una tienda de e-commerce en Costa Rica. Ya probamos en sandbox y encontramos un bloqueo que la documentación no resuelve. La pregunta puntual es la siguiente:
>
> [pegar pregunta específica de la lista abajo]
>
> Gracias 🙏

---

**Contexto:** Integración ONVO Pay para Tony The Witch (tonythewitch.shop) — sitio de e-commerce de tatuajes y merch en Costa Rica. Estamos planificando la integración (Embedded SDK + webhooks + SINPE Móvil) y encontramos varios puntos no documentados públicamente.

**Documentación consultada:** https://docs.onvopay.com (incluyendo `/llms-full.txt`).

Las preguntas están agrupadas por prioridad y categoría. Las respuestas nos desbloquean fases específicas del plan de implementación.

---

## 🔥 Alta prioridad — bloquean el go-live

### 1. Cards: pago cross-currency (intent USD + tarjeta emitida en CRC)

Si creamos un Payment Intent con `currency: "USD"` y el cliente paga con una tarjeta emitida por un banco costarricense (cuenta en CRC, e.g. BAC, BCR, Promerica):

- (a) ¿ONVO procesa el cargo en USD y deja que el emisor maneje la conversión FX?
- (b) ¿ONVO rechaza la transacción por incompatibilidad de moneda?
- (c) ¿ONVO convierte automáticamente al tipo de cambio interno?

**Por qué es crítico:** si la opción (b) ocurre, los clientes locales no pueden pagar con tarjeta. Necesitamos saberlo antes de activar las llaves live.

### 2. Onboarding y activación de llaves live

Tony es persona física (sole proprietor), tatuador, ubicado en Costa Rica:

- ¿Cuáles son los requisitos KYC para activar la cuenta? (cédula, comprobante de domicilio, declaración de ingresos, RTN, etc.)
- ¿Cuál es el tiempo aproximado de aprobación desde que se entrega documentación?
- ¿Hay límites iniciales de volumen mensual durante los primeros meses?
- ¿Hay diferencias en requisitos entre persona física y persona jurídica?

---

## ⚠️ Media prioridad — afectan diseño técnico pero no bloquean

### 3. Idempotency-Key en API requests

¿ONVO soporta el header `Idempotency-Key` en endpoints de mutación (e.g. `POST /v1/payment-intents`, `POST /v1/refunds`)? Si lo soporta:

- ¿Cuál es la TTL de la idempotencia?
- ¿Cuál es el comportamiento si se reenvía con el mismo `Idempotency-Key` (devuelve respuesta original o 409)?

Si NO lo soporta, ¿hay alguna manera de prevenir cobros duplicados desde el lado de ONVO usando `metadata`?

### 4. Eventos de webhook para refunds

La lista pública de eventos no incluye `refund.succeeded` ni `refund.failed`. Si emitimos un reembolso vía API:

- ¿Hay algún webhook que notifique cuando el reembolso se confirma o falla?
- ¿O debemos confiar exclusivamente en la respuesta inmediata de `POST /v1/refunds`?
- Si existe el webhook pero no está documentado: ¿pueden compartir el nombre del evento y la estructura del payload?

### 5. Reembolsos — restricciones generales

- ¿Hay un plazo máximo después del pago original para emitir un reembolso? (e.g., 90 días, 180 días)
- ¿La comisión del 3.5% se reembolsa con el principal, o ONVO la retiene?
- ¿Soportan múltiples reembolsos parciales sobre el mismo pago hasta sumar el total?
- ¿Hay restricciones de moneda en reembolsos (mismo currency que el pago original)?
- ¿Cuál es el tiempo típico de liquidación de un reembolso de tarjeta?

---

## 🟢 Baja prioridad — informativo

### 6. Webhook retry schedule

La documentación indica que ONVO reintenta envíos cuando recibe respuestas no-2xx, pero no publica el calendario. Para dimensionar nuestra retención de logs:

- ¿Cuáles son los intervalos de reintento (backoff exponencial)?
- ¿Cuál es el número máximo de intentos antes de marcar el evento como fallido permanentemente?
- ¿Cuál es la ventana total de reintento (e.g., 24h, 7 días)?

### 7. Webhook egress IPs

¿ONVO publica las IPs desde las cuales envía los webhooks? Útil para configurar allowlist a nivel de firewall (defensa en profundidad además de la verificación del header `X-Webhook-Secret`).

### 8. API rate limits

- ¿Existen rate limits documentados o configurables?
- ¿Hay headers en la respuesta (e.g., `X-RateLimit-Remaining`) que podamos monitorear?
- ¿Cuáles son las cuotas en cuenta de prueba vs producción?

### 9. Liability shift y chargebacks

Cuando 3DS se completa exitosamente, ¿la responsabilidad por chargeback fraudulento se transfiere al emisor (estándar de la industria) o queda con el comercio? Esta info puede ir en documentación general o referenciar normativa local.

---

## Notas para el equipo de soporte

- Estamos en fase de **planificación**, no en producción todavía.
- Cuenta de Tony está en proceso de creación (o por crearse — dependiendo del estado al momento de enviar este email).
- Volumen esperado v1: bajo (<50 órdenes/mes inicialmente, posible crecimiento a 200+/mes en 6 meses).
- Tipos de pago en uso planificados: **tarjeta vía ONVO solamente**. SINPE seguirá siendo manejado por nosotros (transferencia + comprobante manual). SINPE Móvil/PIN/Credix vía ONVO no están en alcance v1.
- Stack técnico: Node.js 20 + Express + PostgreSQL + Vercel deployment.

Pueden responder en español o en inglés, lo que sea más fácil para el equipo. Gracias.

— Diego (developer)
— Tony (merchant / account holder)

---

## Para uso interno (Diego)

**Cuando lleguen las respuestas**, actualizar:
- `docs/onvo-integration-plan.md` §12 (open questions) — marcar resueltas.
- TASK-45/46/47/48 — incorporar respuestas al diseño donde aplique.
- Si Q1 (cross-currency cards) revela que ONVO rechaza USD-on-CRC-card → activar plan B: toggle de moneda en checkout (Option C del plan §12.8).
