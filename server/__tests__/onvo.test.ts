import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  redact,
  OnvoError,
  OnvoConfigError,
  getOnvoEnv,
  isOnvoConfigured,
  verifyWebhookSignature,
  createPaymentIntent,
  getPaymentIntent,
  createRefund,
  _resetOnvoEnvCache,
} from "../onvo";

const VALID_ENV = {
  ONVO_SECRET_KEY: "onvo_test_secret_key_abc",
  ONVO_PUBLISHABLE_KEY: "onvo_test_publishable_key_abc",
  ONVO_WEBHOOK_SECRET: "webhook_secret_abc",
  ONVO_API_BASE_URL: "https://api.onvopay.com",
  ONVO_ENABLED: "true",
};

const ENV_KEYS = [
  "ONVO_SECRET_KEY",
  "ONVO_PUBLISHABLE_KEY",
  "ONVO_WEBHOOK_SECRET",
  "ONVO_API_BASE_URL",
  "ONVO_ENABLED",
] as const;

function setEnv(overrides: Partial<typeof VALID_ENV> = {}) {
  for (const key of ENV_KEYS) delete process.env[key];
  const merged = { ...VALID_ENV, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (v != null) process.env[k] = String(v);
  }
  _resetOnvoEnvCache();
}

beforeEach(() => {
  vi.restoreAllMocks();
  setEnv();
});

afterEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  _resetOnvoEnvCache();
});

describe("redact", () => {
  it("masks sensitive keys", () => {
    const out = redact({
      number: "4242424242424242",
      cvv: "123",
      amount: 1000,
      nested: { cardNumber: "1111", currency: "USD" },
    });
    expect(out).toEqual({
      number: "[REDACTED]",
      cvv: "[REDACTED]",
      amount: 1000,
      nested: { cardNumber: "[REDACTED]", currency: "USD" },
    });
  });

  it("handles arrays", () => {
    expect(redact([{ pan: "x" }, { amount: 1 }])).toEqual([
      { pan: "[REDACTED]" },
      { amount: 1 },
    ]);
  });

  it("returns primitives unchanged", () => {
    expect(redact(42)).toBe(42);
    expect(redact("hello")).toBe("hello");
    expect(redact(null)).toBe(null);
  });

  it("does not loop on deep nesting", () => {
    let nested: Record<string, unknown> = { leaf: "ok" };
    for (let i = 0; i < 20; i++) nested = { child: nested };
    expect(() => redact(nested)).not.toThrow();
  });
});

describe("getOnvoEnv", () => {
  it("parses valid env", () => {
    const env = getOnvoEnv();
    expect(env.ONVO_SECRET_KEY).toBe("onvo_test_secret_key_abc");
    expect(env.ONVO_ENABLED).toBe(true);
  });

  it("throws OnvoConfigError when secret key missing", () => {
    setEnv({ ONVO_SECRET_KEY: "" });
    expect(() => getOnvoEnv()).toThrow(OnvoConfigError);
  });

  it("memoizes result", () => {
    const a = getOnvoEnv();
    const b = getOnvoEnv();
    expect(a).toBe(b);
  });
});

describe("isOnvoConfigured", () => {
  it("returns false when env missing (no throw)", () => {
    setEnv({ ONVO_SECRET_KEY: "" });
    expect(isOnvoConfigured()).toBe(false);
  });

  it("returns false when ONVO_ENABLED=false", () => {
    setEnv({ ONVO_ENABLED: "false" });
    expect(isOnvoConfigured()).toBe(false);
  });

  it("returns true when configured + enabled", () => {
    expect(isOnvoConfigured()).toBe(true);
  });
});

describe("verifyWebhookSignature", () => {
  it("accepts matching secret", () => {
    expect(verifyWebhookSignature("webhook_secret_abc")).toBe(true);
  });

  it("rejects mismatched secret", () => {
    expect(verifyWebhookSignature("webhook_secret_wrong")).toBe(false);
  });

  it("rejects missing header", () => {
    expect(verifyWebhookSignature(undefined)).toBe(false);
    expect(verifyWebhookSignature("")).toBe(false);
  });

  it("rejects different-length secret without crashing", () => {
    expect(verifyWebhookSignature("short")).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// HTTP wrapper — uses global fetch mock
// -----------------------------------------------------------------------------

function mockFetch(body: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200;
  const ok = init.ok ?? (status >= 200 && status < 300);
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }) as unknown as Response,
  );
}

describe("createPaymentIntent", () => {
  it("POSTs to /v1/payment-intents with bearer auth", async () => {
    const fetchSpy = mockFetch({
      id: "pi_123",
      status: "requires_payment_method",
      amount: 5000,
      currency: "USD",
    });

    const intent = await createPaymentIntent({
      amount: 5000,
      currency: "USD",
      metadata: { orderId: "42" },
    });

    expect(intent.id).toBe("pi_123");
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe("https://api.onvopay.com/v1/payment-intents");
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer onvo_test_secret_key_abc");
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent.amount).toBe(5000);
    expect(sent.currency).toBe("USD");
    expect(sent.paymentMethodTypes).toEqual(["card"]);
    expect(sent.captureMethod).toBe("automatic");
    expect(sent.metadata).toEqual({ orderId: "42" });
  });

  it("throws OnvoError with mapped code on 402 card_declined", async () => {
    mockFetch(
      { code: "card_declined", message: "Your card was declined." },
      { status: 402 },
    );

    await expect(
      createPaymentIntent({ amount: 5000, currency: "USD" }),
    ).rejects.toMatchObject({
      name: "OnvoError",
      code: "card_declined",
      httpStatus: 402,
      providerMessage: "Your card was declined.",
    });
  });

  it("maps 401 to authentication code", async () => {
    mockFetch({ message: "bad key" }, { status: 401 });
    await expect(
      createPaymentIntent({ amount: 100, currency: "USD" }),
    ).rejects.toMatchObject({ code: "authentication", httpStatus: 401 });
  });

  it("maps 500 to provider_error", async () => {
    mockFetch({ message: "boom" }, { status: 500 });
    await expect(
      createPaymentIntent({ amount: 100, currency: "USD" }),
    ).rejects.toMatchObject({ code: "provider_error", httpStatus: 500 });
  });

  it("maps network/abort to network code", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      Object.assign(new Error("aborted"), { name: "AbortError" }),
    );
    await expect(
      createPaymentIntent({ amount: 100, currency: "USD" }),
    ).rejects.toMatchObject({ code: "network", httpStatus: 0 });
  });
});

describe("getPaymentIntent", () => {
  it("GETs the intent and url-encodes the id", async () => {
    const fetchSpy = mockFetch({ id: "pi_abc/x", status: "succeeded" });
    await getPaymentIntent("pi_abc/x");
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe("https://api.onvopay.com/v1/payment-intents/pi_abc%2Fx");
    expect((init as RequestInit).method).toBe("GET");
  });
});

describe("createRefund", () => {
  it("POSTs to /v1/refunds with the intent id", async () => {
    const fetchSpy = mockFetch({
      id: "re_1",
      status: "succeeded",
      paymentIntentId: "pi_1",
    });
    const refund = await createRefund({ paymentIntentId: "pi_1", amount: 1000 });
    expect(refund.id).toBe("re_1");
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe("https://api.onvopay.com/v1/refunds");
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent).toEqual({ paymentIntentId: "pi_1", amount: 1000 });
  });
});

describe("OnvoError", () => {
  it("preserves code, status, and provider message", () => {
    const err = new OnvoError("card_declined", 402, "declined", "card_declined", {
      raw: true,
    });
    expect(err.code).toBe("card_declined");
    expect(err.httpStatus).toBe(402);
    expect(err.providerCode).toBe("card_declined");
    expect(err.message).toBe("declined");
  });
});
