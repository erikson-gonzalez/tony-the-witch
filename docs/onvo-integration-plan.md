# ONVO Pay Integration Plan

**Status:** Planning — not yet implemented
**Owner:** Diego (DV)
**Last updated:** 2026-04-26 (architecture revised: ONVO = cards only; manual SINPE permanent)
**Replaces:** TASK-03 PayPal (deprecated — drop)

---

## 1. Goal

Replace the **fake card checkout** (auto-approves any card, no money moves) with **ONVO Pay** for real card processing. **Manual SINPE flow stays permanent** — runs side-by-side with ONVO cards.

Today's checkout:
- `sinpe` — manual proof-upload (customer screenshots SINPE transfer, Tony approves) — **stays as-is, no changes**
- `card` — **fake** — replaced by ONVO

After this work:
- `sinpe` — unchanged, manual proof flow
- `onvo_card` — ONVO Embedded SDK, real card processing in USD

ONVO scope is intentionally narrow: cards only. No ONVO SINPE Móvil, no ONVO SINPE PIN, no Credix. Reasoning: manual SINPE already works for Tony, customers expect that flow, ONVO adds a real card path that's currently missing.

---

## 2. Architecture decision

**Recommendation: Embedded SDK (`https://sdk.onvopay.com/sdk.js`).**

Three modes available:

| Mode | Pros | Cons | Verdict |
|---|---|---|---|
| Hosted Checkout | Lowest effort. ONVO compliance scope. | Brand discontinuity (redirect to `checkout.onvopay.com`). Customer leaves Tony's site mid-purchase. | ❌ |
| Embedded SDK | iframe on `tonythewitch.shop`. Card data never touches our server (PCI SAQ-A). Built-in 3DS, locale (es/en), fraud signals. Modal or inline render. | Slight more setup than hosted. | ✅ **Pick this** |
| Direct API (raw card to server) | Maximum customization. | PCI SAQ-D nightmare (we'd be storing/transmitting raw PAN). Compliance scope explodes. | ❌ |

**Reasoning specific to Tony:**
- Tattoo artist personal-brand site → brand consistency matters; redirect to ONVO domain breaks the vibe.
- Small shop, no PCI compliance team → keep card data out of our server.
- Embedded SDK handles 3DS/SCA out of the box → no challenge-flow plumbing on our side.
- Spanish-first audience with English fallback → SDK's `locale` param fits i18n setup.

**SINPE Móvil via ONVO is NOT in scope.** Manual SINPE proof-upload flow (existing TASK-07 implementation) remains the SINPE path indefinitely. Removes complexity around CRC currency conversion, partial-transfer edge cases, deferred state machines, and ONVO SINPE Móvil onboarding. If volume ever justifies programmatic SINPE, it's a future ticket — out of v1 scope.

---

## 3. Schema changes

Three new tables (`payments`, `webhook_events`, `refunds`) and one enum extension. Keep `orders.paymentStatus` as a denormalized cache for fast list filters in the admin panel; the source of truth for payment lifecycle moves to `payments`.

### 3.1 New tables — Drizzle diff (in `shared/schema.ts`)

```typescript
// =============================================================================
// PAYMENTS — one row per ONVO Payment Intent (multiple per order on retries)
// =============================================================================

export const PAYMENT_PROVIDERS = ["onvo"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_METHOD_TYPES = ["card"] as const;
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

// Manual SINPE orders do NOT have a `payments` row — they live entirely on
// `orders.paymentStatus` with the existing pending|proof_submitted|approved|rejected
// flow from TASK-07. The `payments` table is ONVO-only.

export const PAYMENT_LIFECYCLE_STATES = [
  "requires_payment_method",
  "requires_action",
  "processing",
  "succeeded",
  "failed",
  "canceled",
  "refunded",
  "partially_refunded",
] as const;
export type PaymentLifecycleState = (typeof PAYMENT_LIFECYCLE_STATES)[number];

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),

  provider: text("provider").notNull().$type<PaymentProvider>(),
  providerIntentId: text("provider_intent_id"),     // ONVO payment-intent id (unique per provider)
  providerChargeId: text("provider_charge_id"),

  methodType: text("method_type").notNull().$type<PaymentMethodType>(),
  amountCents: integer("amount_cents").notNull(),    // amount captured (or attempted) in `currency`
  currency: text("currency").notNull(),              // "USD" or "CRC"

  state: text("state").notNull().$type<PaymentLifecycleState>().default("requires_payment_method"),

  failureCode: text("failure_code"),
  failureMessage: text("failure_message"),

  rawCreate: jsonb("raw_create"),                    // raw ONVO response on create
  rawConfirm: jsonb("raw_confirm"),                  // raw ONVO response on confirm
  rawLatestEvent: jsonb("raw_latest_event"),         // last webhook payload merged in

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("payments_order_id_idx").on(table.orderId),
  index("payments_provider_intent_idx").on(table.provider, table.providerIntentId),
  index("payments_state_idx").on(table.state),
]);

// =============================================================================
// WEBHOOK EVENTS — idempotency log
// =============================================================================

export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull().$type<PaymentProvider>(),
  eventType: text("event_type").notNull(),           // "payment-intent.succeeded" etc
  providerEventId: text("provider_event_id"),        // if ONVO supplies one; else hash(payload)
  dedupKey: text("dedup_key").notNull().unique(),    // composite: provider:eventType:providerEventId|hash
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at"),            // null until handled successfully
  processingError: text("processing_error"),         // last error if retries exhausted
  receivedAt: timestamp("received_at").defaultNow().notNull(),
}, (table) => [
  index("webhook_events_processed_idx").on(table.processedAt),
]);

// =============================================================================
// REFUNDS
// =============================================================================

export const REFUND_STATES = ["pending", "succeeded", "failed"] as const;
export type RefundState = (typeof REFUND_STATES)[number];

export const refunds = pgTable("refunds", {
  id: serial("id").primaryKey(),
  paymentId: integer("payment_id").notNull().references(() => payments.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  provider: text("provider").notNull().$type<PaymentProvider>(),
  providerRefundId: text("provider_refund_id"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),
  reason: text("reason"),
  state: text("state").notNull().$type<RefundState>().default("pending"),
  initiatedByUserId: integer("initiated_by_user_id").references(() => adminUsers.id),
  raw: jsonb("raw"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("refunds_payment_idx").on(table.paymentId),
  index("refunds_order_idx").on(table.orderId),
]);
```

### 3.2 Extend `orders` table

Add new statuses + payment method values. **Backward-compatible** — existing rows untouched.

```typescript
// Replace existing PAYMENT_STATUSES export
export const PAYMENT_STATUSES = [
  "pending",            // legacy: SINPE manual created, awaiting proof
  "proof_submitted",    // legacy: SINPE manual proof uploaded
  "awaiting_payment",   // NEW: ONVO order created, intent not yet succeeded
  "processing",         // NEW: ONVO confirmed, awaiting webhook
  "approved",           // unchanged: terminal success
  "rejected",           // unchanged: terminal failure
  "refunded",           // NEW: full refund issued
  "partially_refunded", // NEW
] as const;

// insertOrderSchema — extend paymentMethod enum:
paymentMethod: z.enum(["sinpe", "onvo_card"]),
// "sinpe" = legacy manual proof-upload flow (kept indefinitely)
// "onvo_card" = new ONVO card flow
// "card" (legacy fake) is REMOVED — was never real, no historical data depends on it
```

**Migration ordering:**
1. Add `payments`, `webhook_events`, `refunds` tables (additive, no risk).
2. Extend `paymentStatus` enum values via Zod only (column is plain `text`, no DB enum to alter).
3. Backfill: existing orders stay on `pending|proof_submitted|approved|rejected`. New ONVO orders use new values.

### 3.3 Site config addition

```typescript
// SiteConfigData — add:
onvo: z.object({
  enabled: z.boolean().default(false),
}).optional(),
```

Lets admin toggle ONVO card payments on/off without redeploy. When `false`, checkout shows manual SINPE only.

---

## 4. Route changes

### 4.1 New endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/payments/onvo/intents` | public, rate-limited (3/15min/IP, same as `/api/orders`) | Create ONVO Payment Intent for an existing order. Returns `{ paymentIntentId, publishableKey, returnUrl }` for SDK. |
| `GET` | `/api/payments/onvo/intents/:id` | public, email-gated like existing status endpoint | Poll intent status (UI fallback if webhook is slow). |
| `POST` | `/api/webhooks/onvo` | public, signature-verified (NOT CSRF-protected) | Webhook handler — see §4.3 |
| `POST` | `/api/admin/orders/:id/refund` | admin + CSRF | Issue full or partial refund (ONVO orders only — manual SINPE refunds handled differently). |
| `GET` | `/api/admin/payments/:id` | admin | Payment detail for admin order view. |

### 4.2 Modified endpoints

- `POST /api/orders` — split logic by `paymentMethod`:
  - `sinpe` (manual proof-upload, permanent): **unchanged from TASK-07.** Status starts `pending`. Stock decrements on create. Customer uploads proof, Tony approves/rejects in admin.
  - `onvo_card`: status starts `awaiting_payment`. **Stock NOT decremented** at this stage. Returns `{ id, orderNumber, totalUsd, totalCrc, paymentIntentId, publishableKey }` so client can immediately mount SDK.
- `PUT /api/admin/orders/:id/approve` — kept for manual SINPE orders. Hidden for ONVO orders (auto-approved via webhook).
- `PUT /api/admin/orders/:id/reject` — kept for manual SINPE. For ONVO orders, admin uses refund endpoint (which also calls ONVO `/v1/payment-intents/:id/cancel` if intent isn't yet succeeded).

### 4.3 Webhook handler — `POST /api/webhooks/onvo`

Mounted **before** the body-parsing middleware that handles JSON for the rest of `/api`, OR with raw-body capture, since signature verification may need the original bytes. Bypasses CSRF middleware.

```
1. Read X-Webhook-Secret header.
2. Constant-time compare against env ONVO_WEBHOOK_SECRET. Reject 401 on mismatch.
3. Parse JSON body.
4. Compute dedupKey: provider="onvo" + eventType + providerEventId
   (if ONVO doesn't supply event id, use SHA-256 of the body).
5. INSERT INTO webhook_events with dedupKey UNIQUE — if conflict, return 200 immediately
   (already processed or in-flight; idempotent).
6. Look up payments row by providerIntentId (from event.data.id).
7. Map event type → state transition (state machine, §5.1).
8. In a single TX:
   a. Update payments row (state, raw merge).
   b. Update orders row (paymentStatus mirror).
   c. On succeeded: decrement stock (using existing adjustStock helper).
   d. On failed/canceled: no stock change (was never decremented).
   e. Mark webhook_events.processedAt = now().
9. Send customer email outside TX (best-effort, ~existing pattern).
10. Return 200.
```

**Errors during processing:** leave `webhook_events.processedAt` NULL, set `processingError`, return 500. ONVO will retry (exponential backoff, undocumented schedule — confirm with support; assume up to 24h). Manual recovery via admin "replay webhook" button (§6).

**Important security notes:**
- Webhook signature scheme per ONVO docs is bare-secret comparison via `X-Webhook-Secret` header, **not** HMAC over the body. This is weaker than Stripe's signature scheme but easier. **Open question for ONVO support: confirm signature algorithm — is it really plain string compare, or is it HMAC-SHA256?** Verify before going live.
- Constant-time compare (`crypto.timingSafeEqual`) — no shortcut to avoid timing attacks.
- Endpoint must accept large/unknown payload shapes gracefully (forward-compatible — ONVO may add fields).
- Rate-limit the webhook endpoint at the edge (Vercel) — at minimum, IP allowlist if ONVO publishes their egress IPs.

---

## 5. State machine

### 5.1 Order status transitions (ONVO orders)

```
[create order, paymentMethod=onvo_*]
        |
        v
  awaiting_payment ────────────────────────────────────────┐
        |                                                  |
        | (client calls SDK / SINPE confirm)               |
        v                                                  |
     processing ─── (3DS challenge if card) ─── processing |
        |                                                  |
   ┌────┼─────────────────────┬───────────┐                |
   |    |                     |           |                |
   |    v                     v           v                |
   |  succeeded            failed      canceled <──────────┘
   |    |                                                   (admin cancels stale awaiting_payment)
   |    v                                                  
   |  approved (terminal)                                  
   |    |                                                  
   |    | (admin issues refund)                            
   |    v                                                  
   └─> partially_refunded ──> refunded (full)              
```

**Stock side-effects:**
- `awaiting_payment → succeeded`: decrement stock in same TX as state change. Reject 409 with `intent.cancel()` if oversold (rare race).
- `succeeded → refunded`: restore stock.
- `succeeded → partially_refunded`: no stock change (item shipped / partial money-back only).
- `awaiting_payment → failed/canceled`: no stock change.

### 5.2 Manual SINPE (permanent, unchanged from TASK-07)

```
pending ──(proof uploaded)──> proof_submitted ──(admin approves)──> approved
   |                                |
   |                          (admin rejects, restore stock)
   |                                v
   └────────────────────────> rejected
```

**Stock decrement:** on order create, restored on reject (existing behavior). **No `payments` row** for these orders — manual SINPE state lives entirely on the `orders` table.

---

## 6. Frontend flow

### 6.1 Card flow (ONVO Embedded SDK)

```
Cart → Checkout form (customer info, shipping)
   ↓
Click "Pagar con tarjeta"
   ↓
[POST /api/orders, paymentMethod=onvo_card]
   ↓ returns { orderId, paymentIntentId, publishableKey }
   ↓
Render SDK: onvo.pay({
  publicKey,
  paymentIntentId,
  paymentType: "one_time",
  locale: i18n.language,
  onSuccess: (data) => router.push(`/order/${orderNumber}/success`),
  onError: (data) => showRetryUI(),
}).render("#onvo-mount")
   ↓
SDK handles: card form, validation, 3DS challenge, fraud signals
   ↓
onSuccess fires → poll /api/orders/:orderNumber/status until paymentStatus=approved
   (webhook may arrive before redirect — expected)
   ↓
Success page: order number, items, "we'll email you" copy
```

### 6.2 Manual SINPE flow (permanent, unchanged from TASK-07)

Untouched from current implementation. Customer chooses SINPE → uploads proof image → Tony reviews in admin panel → approves or rejects. Documented at TASK-07c (checkout) + TASK-07d (admin).

### 6.3 Error UX

- Card declined → show translated error message, "intentar otra tarjeta" button (re-mounts SDK with same intent if non-terminal), OR "usar SINPE manual" fallback link
- SDK init fails → automatic fallback to manual SINPE
- Network timeout on intent create → app-side idempotency (partial UNIQUE on `payments`) returns existing intent

---

## 7. Admin panel impact

### 7.1 Changes to `admin-orders.tsx` (list)

- New status filter tabs: `awaiting_payment`, `processing`, `refunded`, `partially_refunded`
- Show payment method icon next to order (ONVO card vs manual SINPE)
- For ONVO orders: link to `payments.providerIntentId` → ONVO Dashboard deep link

### 7.2 Changes to `admin-order-detail.tsx`

- New "Pagos" section: list of `payments` rows (intent ID, amount, currency, state, timestamps)
- New "Reembolsos" section: list of `refunds`, "Refund" button (full or partial)
- Hide approve/reject buttons for ONVO orders (auto-approved by webhook)
- Show "Replay webhook" button for stuck `processing` orders (admin-only escape hatch)
- Link out to ONVO Dashboard for the intent (using `https://dashboard.onvopay.com/payment-intents/{id}` — verify URL pattern)

### 7.3 Changes to `admin-billing.tsx`

- Add ONVO fee column to revenue calc (3.5% per ONVO docs, plus 2% retention if marketplace splits used — likely irrelevant for Tony)
- Net revenue = gross − ONVO fees − refunds

### 7.4 New admin page: `admin-webhook-events.tsx`

Debug view for webhook log. Shows: timestamp, event type, processed status, error, raw payload (collapsed). Lets admin manually re-process a stuck event.

---

## 8. Env vars (Vercel + `.env.example`)

```
ONVO_SECRET_KEY=onvo_test_secret_key_xxxxx           # server-only
ONVO_PUBLISHABLE_KEY=onvo_test_publishable_key_xxxxx # safe to expose to client (served via /api/payments/onvo/config)
ONVO_WEBHOOK_SECRET=webhook_secret_xxxxx             # for verifying X-Webhook-Secret
ONVO_API_BASE_URL=https://api.onvopay.com            # both test + live; mode determined by key
ONVO_ENABLED=false                                   # global kill-switch (start false; flip to true after testing)
ONVO_DEFAULT_CURRENCY=USD                            # USD for cards; SINPE Móvil overrides to CRC
```

`.env.example` MUST list these with empty values + comments. Do NOT commit real keys.

Two Vercel projects (production + preview) need separate test/live keys. **Preview deployments must use test keys** to avoid charging real money on PR demos.

---

## 9. Security checklist

Cross-references existing audit-driven tasks (TASK-31 through TASK-42). ONVO integration must NOT regress any of these.

| Item | Mitigation | Existing task | New task |
|---|---|---|---|
| Webhook bypasses CSRF (intentional) | Signature verification (constant-time), idempotency log, raw-body integrity | TASK-32 (CSRF) | TASK-47 |
| Rate limit on intent creation | `express-rate-limit` 3/15min same as `/api/orders` | TASK-37 | TASK-45 |
| Idempotency on intent create | Use `metadata.orderId` as stable key; check existing `payments` row before creating new | — | TASK-45 |
| Webhook idempotency | `webhook_events.dedupKey` UNIQUE constraint | — | TASK-47 |
| PCI scope = SAQ-A | Embedded SDK only; never log card data; never store PAN | — | TASK-45 |
| Server-side price recompute | Already done in `POST /api/orders` — extend to intent-create endpoint | (existing) | TASK-45 |
| Stock race on `succeeded` | Same `adjustStock` transactional pattern as TASK-19 | TASK-19 (done) | TASK-47 |
| Refund authorization | Admin-only + CSRF + audit log | TASK-32, TASK-28 | TASK-48 |
| Webhook secret leak | Stored in Vercel env, never logged. Rotation procedure documented in runbook. | — | TASK-47 |
| Logging discipline | Never log full ONVO request/response with raw card data. Strip `card.number`, `cvv` before persist. | — | TASK-44 |
| Error messages | Never echo ONVO error messages verbatim to client (may leak info). Map to user-safe codes. | — | TASK-45 |
| 3DS handling | SDK handles natively; verify `intent.status === succeeded` server-side before treating as paid | — | TASK-45 |
| Replay attacks on webhook | `dedupKey` UNIQUE handles it. Optionally add timestamp window (reject events > 1 hour old) — but ONVO's retry model may legitimately deliver day-old events on outage recovery; skip the timestamp window. | — | TASK-47 |

---

## 10. Testing plan

### 10.1 Sandbox

Test keys: `onvo_test_secret_key_*`. Run full flow end-to-end against `https://api.onvopay.com` with test keys.

### 10.2 Test scenarios

| Scenario | Test card / SINPE input | Expected |
|---|---|---|
| Card success | `4242 4242 4242 4242` | `succeeded` webhook within seconds, order → approved, stock decremented |
| Card 3DS challenge | `4000 0000 0000 3220` | `requires_action` → SDK opens 3DS modal → success |
| Card declined | `4000 0000 0000 0002` | `failed` webhook, order → rejected, stock NOT decremented |
| Card processor error | `4000 0000 0000 0119` | `failed` webhook with code |
| Card verification fail | `4000 0000 0000 0127` | Intent creation fails (4xx), no order created or order in failure state |
| Webhook signature wrong | curl with bad header | 401, no state change |
| Webhook duplicate delivery | Same event twice | One state change only, second 200 with no DB write |
| Refund full | After succeeded card | Status → refunded, stock restored, customer email |
| Refund partial | After succeeded card | Status → partially_refunded, stock unchanged |
| Idempotent intent create | Two POSTs with same orderId | Same `paymentIntentId` returned via partial UNIQUE constraint |
| Network drop mid-confirm | Disable network, confirm, re-enable | UI retry → server returns existing intent |
| Manual SINPE regression | Existing TASK-07 flow | Unchanged behavior — customer uploads proof, admin approves |

### 10.3 Tests to add (Vitest, follows TASK-41 pattern)

- `webhook-handler.test.ts` — signature verify (valid/invalid), idempotency, state transitions, stock decrement
- `onvo-client.test.ts` — REST wrapper with mocked fetch; error mapping; redaction
- `payments-storage.test.ts` — schema CRUD, state transitions, refund creation
- E2E (Playwright optional, defer): full card flow in sandbox; manual SINPE regression

### 10.4 Manual production smoke

After live keys flip:
1. Tony makes self-test purchase of a $1 product (real money).
2. Verify order, email, ONVO dashboard.
3. Refund it.
4. Verify refund email + stock restoration.

---

## 11. Rollout

### 11.1 Phased deploy

1. **Phase A — schema only (TASK-43).** Deploy new tables. No behavior change. Verify migration applies cleanly on Vercel.
2. **Phase B — server + admin (TASK-44/47/48).** Deploy with `ONVO_ENABLED=false`. Webhook endpoint live but unused. Admin can see empty `payments` list.
3. **Phase C — card flow sandbox (TASK-45).** Flip `siteConfig.onvo.enabled=true` for one admin-flagged session (cookie). Run full sandbox test scenarios.
4. **Phase D — card flow live (TASK-45 + TASK-50 checklist).** Tony self-tests w/ personal CR card on live keys. Refund self-tested. Flip `siteConfig.onvo.enabled=true` for all users.
5. **Manual SINPE stays live throughout all phases.** Both methods coexist permanently.

### 11.2 Kill switches (in priority order)

1. **`siteConfig.onvo.enabled = false`** — admin toggle, no redeploy. Hides ONVO card option; checkout shows manual SINPE only.
2. **`ONVO_ENABLED=false` env var** — Vercel-level disable.
3. **Remove webhook URL from ONVO Dashboard** — stops new events; existing succeeded orders unaffected.

### 11.3 Feature flag UI

Admin page → "Configuración" → toggle "ONVO Pay activo". Persists to `site_config.onvo.enabled` JSONB. No redeploy needed.

### 11.4 Rollback plan

If ONVO has an outage:
1. Flip `siteConfig.onvo.enabled = false`.
2. Customers see manual SINPE only — flow unaffected.
3. In-flight `awaiting_payment` ONVO orders stuck — admin uses "replay webhook" button or contacts customers.

---

## 12. Open questions

To answer with ONVO support before Phase 5 implementation:

1. ~~**Webhook signature algorithm.**~~ **RESOLVED 2026-04-26 from ONVO docs (Webhooks → Seguridad).** Header `X-Webhook-Secret: webhook_secret_...` — bare-string compare against the secret shown in Dashboard. No HMAC. Constant-time compare in handler. Secret prefix is always `webhook_secret_`.
2. **Webhook retry schedule.** Confirmed 2026-04-26: ONVO docs say "puede reintentar" on non-2xx, system must tolerate retries + out-of-order, but NO public schedule (intervals, max attempts, backoff window). **Action:** keep on support-email batch as low-priority informational ask. **Decision:** sync handler is fine for v1 (latency <3s expected, well under Vercel 10s default). Idempotency `dedupKey` UNIQUE neutralizes any retry frequency. Switch to store-then-process w/ background worker only if p95 latency >3s OR Vercel timeouts observed.
3. ~~**Idempotency on intent creation.**~~ **RESOLVED 2026-04-26.** ONVO docs silent on `Idempotency-Key` header, metadata-based dedup, and duplicate-charge guidance (only retry guidance applies to webhooks). Treat as: ONVO does NOT dedup. Enforce app-side: (a) partial UNIQUE index on `payments(order_id) WHERE state IN ('requires_payment_method','requires_action','processing','deferred')`; (b) `SELECT FROM orders WHERE id = $1 FOR UPDATE` inside intent-create TX; (c) on unique-violation, re-read and return existing `providerIntentId`. Optionally bundle into support email for informational confirmation, but plan assumes worst case.
4. **Refund details.** **Partially resolved 2026-04-26.** ONVO docs confirm: `POST /v1/refunds` with `paymentIntentId` + optional `amount` (cents). Partial refunds supported. **Still unknown** (must ask support, bundled in email batch):
   - (a) Time limit on issuing refunds (can we refund 60-day-old orders?)
   - (b) Fee treatment — is the 3.5% ONVO commission refunded with the principal, or retained?
   - (c) **Refund webhook events** — none documented (no `refund.succeeded`/`refund.failed` in event list). Confirm whether silent or absent.
   - (d) **SINPE Móvil refund mechanics** — auto-return to customer's SINPE phone, or manual? (Critical for customer-support copy.)
   - (e) Refund-object lifecycle / status field shape (handle defensively until known).
   - (f) Cross-currency restrictions.
   - (g) Settlement time for cards.
5. **API rate limits.** Any documented quotas? Headers we should monitor?
6. **Webhook IP allowlist.** Does ONVO publish their egress IPs for firewall allowlisting?
7. **SINPE Móvil partial flows.** **Partially resolved 2026-04-26.** Docs confirm `+50688883333` simulates "transferencia del 50% y luego otra del 50% restante", but webhook sequencing is silent: two separate events vs one consolidated, intermediate state, presence of `amountReceived` field — all unknown. **Defensive plan:** state machine treats any `succeeded` with `data.amount < expected` as partial; stays in `processing`; accumulates until cumulative ≥ expected. **Bundle for support email:** confirm sequencing + payload field for `amountReceived`. Also ask: behavior when customer transfers wrong amount (under/over) — also undocumented and customer-support critical.
8. **Currency negotiation for cards.** **Partially resolved 2026-04-26.** Docs confirm SINPE Móvil = CRC hard restriction. Cards = SILENT on cross-currency behavior. **Decision:** USD-only intents on cards (option A+D — see plan §6.1 + §11). UI shows "Total: $X.XX USD (≈ ₡Y)" with caption explaining issuer handles FX. **Risk:** if ONVO rejects USD intent on CR-issued card, CR customers cannot pay by card (big problem). **Mitigation:** (1) Tony self-tests with personal CR card pre-launch (TASK-50 checklist); (2) bundle into support email batch — HIGH PRIORITY (must answer before live keys).
9. **Tony's KYC / account onboarding.** Required business documents? Timeline from sign-up to live keys? (`Persona Física` — sole proprietor — vs `Jurídica`?) ONVO support contact needed.
10. **Live key activation.** What approval steps? Volume limits in early days?
11. ~~**Customer object reuse.**~~ **RESOLVED 2026-04-26.** Docs confirm `/v1/customers` endpoints exist but uniqueness, schema, and dedup behavior are undocumented. **Decision (aligned w/ Diego's Decision C — defer saved cards):** v1 skips ONVO Customer creation entirely. PaymentIntents created without `customerId`. Customer email + name carried via `metadata` only. Re-evaluate when saved-cards/one-click is built post-v1; at that point, do email lookup against our `orders` table and call `POST /v1/customers` only on first encounter, or implement search-then-create pattern. No support email needed.
12. ~~**3DS exemptions.**~~ **RESOLVED 2026-04-26.** Docs confirm 3DS is issuer-triggered (not merchant-configurable). ONVO returns `requires_action` reactively; SDK auto-handles the challenge modal. No merchant exemption rules available. **Decision:** current plan correct — TASK-45 already handles `requires_action` natively via SDK. No code changes. **Deferred (low-priority support questions, ask only if needed):** chargeback liability shift, CR regulatory landscape (BCCR/SUGEF). Both moot for v1 — ONVO carries compliance burden; first chargeback (if any) prompts the conversation.

For Diego (user) — all RESOLVED 2026-04-27:

A. **Manual SINPE** — RESOLVED. Permanent, side-by-side with ONVO cards. No sunset.
B. **Refunds** — RESOLVED. Admin-only. No customer self-service.
C. **Saved cards / one-click** — RESOLVED. **Defer.** v1 has no Customer object. Anonymous PaymentIntents only.
D. **3DS challenge UX** — RESOLVED. **SDK modal** (built-in, brand-on-domain, no redirect plumbing).
E. **Refund confirmation** — RESOLVED. **Typed order-number confirmation** (matches deletion patterns).

---

## 13. Task breakdown

See sprint plan in `tasks/ROADMAP.md` (Sprint 6 — ONVO Pay). Tickets:

- **TASK-43** — Payments / webhook_events / refunds schema + Drizzle migration
- **TASK-44** — ONVO REST client wrapper (`server/onvo.ts`) + env validation + redaction
- **TASK-45** — Card checkout flow (intent create + SDK mount + confirm + 3DS)
- ~~**TASK-46**~~ — **CANCELLED** (ONVO SINPE Móvil dropped from scope; manual SINPE permanent)
- **TASK-47** — Webhook handler (signature verify + idempotency + state machine + stock side-effect)
- **TASK-48** — Admin refunds (UI + endpoint + audit log) — ONVO card orders only
- ~~**TASK-49**~~ — **CANCELLED** (manual SINPE permanent, no sunset)
- **TASK-50** — Rollout + observability (kill switches, replay-webhook admin tool, runbook)

Execution order: 43 → 44 → (45 ∥ 47) → 48 → 50

---

## 14. References

- ONVO docs: https://docs.onvopay.com
- LLM-friendly full export: https://docs.onvopay.com/llms-full.txt
- OpenAPI spec: https://docs.onvopay.com/openapi.yaml
- Existing manual SINPE flow: TASK-07 (umbrella) + TASK-07a/b/c/d/e
- Deprecated PayPal task: TASK-03 (drop, do not implement)
- Stock pattern: TASK-19 (transactional order creation), TASK-16 (stock deduction)
- Audit log pattern: TASK-28
- CSRF + admin mutations: TASK-32 (must land before TASK-48)
