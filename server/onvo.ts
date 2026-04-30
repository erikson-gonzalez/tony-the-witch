import { z } from "zod";

// =============================================================================
// Environment
// =============================================================================

const envSchema = z.object({
  ONVO_SECRET_KEY: z.string().min(1),
  ONVO_PUBLISHABLE_KEY: z.string().min(1),
  // Webhook secret only required by the webhook handler. Smoke tests / REST
  // calls do not need it — keep optional so the wrapper boots without it.
  ONVO_WEBHOOK_SECRET: z.string().min(1).optional(),
  ONVO_API_BASE_URL: z.string().url().default("https://api.onvopay.com"),
  ONVO_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

export type OnvoEnv = z.infer<typeof envSchema>;

let cachedEnv: OnvoEnv | null = null;
let envWarned = false;

export function getOnvoEnv(): OnvoEnv {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new OnvoConfigError(
      "ONVO env vars missing or invalid: " +
        parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
    );
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

export function isOnvoConfigured(): boolean {
  try {
    return getOnvoEnv().ONVO_ENABLED;
  } catch (err) {
    if (!envWarned) {
      console.warn(
        "[onvo] disabled — env not configured:",
        err instanceof Error ? err.message : "unknown",
      );
      envWarned = true;
    }
    return false;
  }
}

// Test-only: reset memoized env so tests can mutate process.env between cases.
export function _resetOnvoEnvCache(): void {
  cachedEnv = null;
  envWarned = false;
}

// =============================================================================
// Errors
// =============================================================================

export class OnvoConfigError extends Error {
  readonly name = "OnvoConfigError";
}

export type OnvoErrorCode =
  | "card_declined"
  | "requires_action"
  | "invalid_request"
  | "authentication"
  | "rate_limited"
  | "network"
  | "provider_error"
  | "unknown";

export class OnvoError extends Error {
  readonly name = "OnvoError";

  constructor(
    readonly code: OnvoErrorCode,
    readonly httpStatus: number,
    readonly providerMessage: string,
    readonly providerCode: string | null = null,
    readonly raw: unknown = null,
  ) {
    super(providerMessage);
  }
}

function mapHttpToCode(status: number, providerCode: string | null): OnvoErrorCode {
  if (providerCode === "card_declined") return "card_declined";
  if (providerCode === "requires_action" || providerCode === "authentication_required")
    return "requires_action";
  if (status === 401 || status === 403) return "authentication";
  if (status === 429) return "rate_limited";
  if (status >= 400 && status < 500) return "invalid_request";
  if (status >= 500) return "provider_error";
  return "unknown";
}

// =============================================================================
// Redaction (never log raw card data)
// =============================================================================

const REDACT_KEYS = new Set([
  "number",
  "cardNumber",
  "card_number",
  "pan",
  "cvv",
  "cvc",
  "securityCode",
  "security_code",
  "ONVO_SECRET_KEY",
  "ONVO_WEBHOOK_SECRET",
  "Authorization",
  "authorization",
]);

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACT_KEYS.has(k) ? "[REDACTED]" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

// =============================================================================
// HTTP core
// =============================================================================

const DEFAULT_TIMEOUT_MS = 10_000;

interface RequestOptions {
  method: "GET" | "POST" | "DELETE";
  path: string;
  body?: unknown;
  timeoutMs?: number;
}

async function onvoFetch<T>({
  method,
  path,
  body,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: RequestOptions): Promise<T> {
  const env = getOnvoEnv();
  const url = `${env.ONVO_API_BASE_URL.replace(/\/+$/, "")}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${env.ONVO_SECRET_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body == null ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const isAbort = err instanceof Error && err.name === "AbortError";
    throw new OnvoError(
      "network",
      0,
      isAbort ? "Request to ONVO timed out" : "Network error contacting ONVO",
      null,
      null,
    );
  }
  clearTimeout(timeout);

  const text = await res.text();
  let parsed: unknown = null;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // Fall through — non-JSON body, treat as provider error.
    }
  }

  if (!res.ok) {
    const errBody = parsed as
      | { code?: string; message?: string; error?: { code?: string; message?: string } }
      | null;
    const providerCode =
      errBody?.code ?? errBody?.error?.code ?? null;
    const providerMessage =
      errBody?.message ?? errBody?.error?.message ?? `ONVO ${res.status}`;
    throw new OnvoError(
      mapHttpToCode(res.status, providerCode),
      res.status,
      providerMessage,
      providerCode,
      parsed,
    );
  }

  return (parsed as T) ?? ({} as T);
}

// =============================================================================
// Types — loose by design; only fields we read are required.
// =============================================================================

// Real ONVO statuses (verified 2026-04-29 via openapi.yaml). Includes
// `requires_capture` (manual capture flow) and refund terminal states.
const PAYMENT_INTENT_STATUSES = [
  "requires_payment_method",
  "requires_action",
  "requires_capture",
  "processing",
  "succeeded",
  "failed",
  "canceled",
  "refunded",
  "partially_refunded",
] as const;
export type OnvoIntentStatus = (typeof PAYMENT_INTENT_STATUSES)[number];

export const onvoPaymentIntentSchema = z
  .object({
    id: z.string(),
    status: z.string(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    captureMethod: z.string().optional(),
    mode: z.string().optional(),
    nextAction: z.unknown().optional(),
    charges: z.array(z.unknown()).optional(),
    lastPaymentError: z
      .object({
        code: z.string().optional(),
        message: z.string().optional(),
        type: z.string().optional(),
      })
      .nullish(),
  })
  .passthrough();

export type OnvoPaymentIntent = z.infer<typeof onvoPaymentIntentSchema>;

export const onvoRefundSchema = z
  .object({
    id: z.string(),
    status: z.string(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    paymentIntentId: z.string().optional(),
  })
  .passthrough();

export type OnvoRefund = z.infer<typeof onvoRefundSchema>;

// =============================================================================
// Public API
// =============================================================================

// ONVO supports more currencies (GTQ/NIO/PAB/PEN/MXN/COP/HNL); we only use
// USD for cards. CRC reserved if we ever wire SINPE Móvil (out of v1 scope).
export type OnvoCurrency = "USD" | "CRC";

export interface CreatePaymentIntentInput {
  amount: number; // smallest currency unit (cents for USD, colones for CRC)
  currency: OnvoCurrency;
  captureMethod?: "automatic" | "manual";
  description?: string;
  metadata?: Record<string, string>;
  receiptEmail?: string;
  statementDescriptor?: string;
  customer?: { name?: string; email?: string; phone?: string };
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<OnvoPaymentIntent> {
  // Body intentionally omits unset fields — ONVO rejects unknown properties
  // (e.g. `paymentMethodTypes` returns 400 "should not exist").
  const body: Record<string, unknown> = {
    amount: input.amount,
    currency: input.currency,
    captureMethod: input.captureMethod ?? "automatic",
  };
  if (input.description) body.description = input.description;
  if (input.metadata) body.metadata = input.metadata;
  if (input.receiptEmail) body.receiptEmail = input.receiptEmail;
  if (input.statementDescriptor) body.statementDescriptor = input.statementDescriptor;
  if (input.customer) body.customer = input.customer;

  const raw = await onvoFetch<unknown>({
    method: "POST",
    path: "/v1/payment-intents",
    body,
  });
  return onvoPaymentIntentSchema.parse(raw);
}

export async function getPaymentIntent(id: string): Promise<OnvoPaymentIntent> {
  const raw = await onvoFetch<unknown>({
    method: "GET",
    path: `/v1/payment-intents/${encodeURIComponent(id)}`,
  });
  return onvoPaymentIntentSchema.parse(raw);
}

export async function cancelPaymentIntent(id: string): Promise<OnvoPaymentIntent> {
  const raw = await onvoFetch<unknown>({
    method: "POST",
    path: `/v1/payment-intents/${encodeURIComponent(id)}/cancel`,
  });
  return onvoPaymentIntentSchema.parse(raw);
}

export interface CreateRefundInput {
  paymentIntentId: string;
  amount?: number; // cents — omit for full refund
  reason?: string;
}

export async function createRefund(input: CreateRefundInput): Promise<OnvoRefund> {
  const raw = await onvoFetch<unknown>({
    method: "POST",
    path: "/v1/refunds",
    body: input,
  });
  return onvoRefundSchema.parse(raw);
}

// =============================================================================
// Webhook signature verification
// =============================================================================
// Per ONVO docs (2026-04-26): bare-string compare against `X-Webhook-Secret`
// header — no HMAC. Constant-time compare to avoid timing leaks.
// Open question §12.1: re-confirm with ONVO support before live keys.

import { timingSafeEqual } from "crypto";

export function verifyWebhookSignature(headerSecret: string | undefined): boolean {
  if (!headerSecret) return false;
  const expected = getOnvoEnv().ONVO_WEBHOOK_SECRET;
  if (!expected) {
    throw new OnvoConfigError(
      "ONVO_WEBHOOK_SECRET is not set — cannot verify webhook signatures",
    );
  }
  const a = Buffer.from(headerSecret);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
