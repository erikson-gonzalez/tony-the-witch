import "dotenv/config";
import {
  createPaymentIntent,
  getPaymentIntent,
  cancelPaymentIntent,
  redact,
  isOnvoConfigured,
  OnvoError,
} from "../server/onvo";

function log(label: string, value: unknown) {
  console.log(`\n--- ${label} ---`);
  console.log(JSON.stringify(redact(value), null, 2));
}

async function main() {
  if (!isOnvoConfigured()) {
    console.error("ONVO not configured. Set ONVO_SECRET_KEY/PUBLISHABLE_KEY/ENABLED=true in .env");
    process.exit(1);
  }

  console.log("Creating $1.00 USD test payment intent...");
  const created = await createPaymentIntent({
    amount: 100,
    currency: "USD",
    description: "ONVO smoke test (Tony The Witch)",
    metadata: { source: "smoke-test", ts: new Date().toISOString() },
  });
  log("CREATE response", created);

  if (!created.id) {
    console.error("Created intent has no id — wrapper schema may be wrong");
    process.exit(1);
  }

  console.log(`\nFetching intent ${created.id}...`);
  const fetched = await getPaymentIntent(created.id);
  log("GET response", fetched);

  console.log(`\nCanceling intent ${created.id}...`);
  try {
    const canceled = await cancelPaymentIntent(created.id);
    log("CANCEL response", canceled);
  } catch (err) {
    if (err instanceof OnvoError) {
      console.warn(
        `Cancel failed (non-fatal — intent state may not allow cancel): ${err.code} / ${err.providerMessage}`,
      );
    } else {
      throw err;
    }
  }

  console.log("\nSmoke test complete.");
}

main().catch((err) => {
  if (err instanceof OnvoError) {
    console.error(
      `\nOnvoError: code=${err.code} httpStatus=${err.httpStatus} providerCode=${err.providerCode}`,
    );
    console.error(`message: ${err.providerMessage}`);
    log("raw error body", err.raw);
  } else {
    console.error("\nUnexpected error:", err);
  }
  process.exit(1);
});
