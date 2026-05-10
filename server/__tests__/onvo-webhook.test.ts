import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { onvoWebhookHandler } from "../onvo-webhook";
import { _resetOnvoEnvCache } from "../onvo";

const VALID_ENV = {
  ONVO_SECRET_KEY: "onvo_test_secret_key_abc",
  ONVO_PUBLISHABLE_KEY: "onvo_test_publishable_key_abc",
  ONVO_WEBHOOK_SECRET: "webhook_secret_correct",
  ONVO_API_BASE_URL: "https://api.onvopay.com",
  ONVO_ENABLED: "true",
};

const ENV_KEYS = Object.keys(VALID_ENV);

function setEnv(overrides: Partial<typeof VALID_ENV> = {}) {
  for (const k of ENV_KEYS) delete process.env[k];
  for (const [k, v] of Object.entries({ ...VALID_ENV, ...overrides })) {
    if (v != null) process.env[k] = String(v);
  }
  _resetOnvoEnvCache();
}

function makeReq(headers: Record<string, string>, body: unknown) {
  return {
    body,
    header(name: string) {
      const lower = name.toLowerCase();
      const found = Object.keys(headers).find((k) => k.toLowerCase() === lower);
      return found ? headers[found] : undefined;
    },
  } as unknown as Parameters<typeof onvoWebhookHandler>[0];
}

function makeRes() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Parameters<typeof onvoWebhookHandler>[1] & typeof res;
}

beforeEach(() => {
  vi.restoreAllMocks();
  setEnv();
});

afterEach(() => {
  for (const k of ENV_KEYS) delete process.env[k];
  _resetOnvoEnvCache();
});

describe("onvoWebhookHandler — signature verification", () => {
  it("rejects with 401 when header missing", async () => {
    const req = makeReq({}, {
      type: "payment-intent.succeeded",
      data: { id: "pi_1", status: "succeeded" },
    });
    const res = makeRes();
    await onvoWebhookHandler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("rejects with 401 when secret mismatched", async () => {
    const req = makeReq(
      { "X-Webhook-Secret": "webhook_secret_wrong" },
      { type: "payment-intent.succeeded", data: { id: "pi_1" } },
    );
    const res = makeRes();
    await onvoWebhookHandler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("returns 500 if ONVO_WEBHOOK_SECRET not configured", async () => {
    setEnv({ ONVO_WEBHOOK_SECRET: undefined });
    const req = makeReq(
      { "X-Webhook-Secret": "anything" },
      { type: "payment-intent.succeeded", data: { id: "pi_1" } },
    );
    const res = makeRes();
    await onvoWebhookHandler(req, res);
    expect(res.statusCode).toBe(500);
  });
});

describe("onvoWebhookHandler — payload validation", () => {
  it("400 on malformed envelope (missing type)", async () => {
    const req = makeReq(
      { "X-Webhook-Secret": "webhook_secret_correct" },
      { data: { id: "pi_1" } },
    );
    const res = makeRes();
    await onvoWebhookHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("400 on missing data", async () => {
    const req = makeReq(
      { "X-Webhook-Secret": "webhook_secret_correct" },
      { type: "payment-intent.succeeded" },
    );
    const res = makeRes();
    await onvoWebhookHandler(req, res);
    expect(res.statusCode).toBe(400);
  });
});
