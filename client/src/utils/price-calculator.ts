const PAYPAL_FEE = 0.08;
const PLATFORM_FEE = 0.05;
const TOTAL_FEE = PAYPAL_FEE + PLATFORM_FEE;
const NET_MULTIPLIER = 1 - TOTAL_FEE; // 0.87

/** Neto que recibe el comercio (después de comisiones) */
export function calculateNetAmount(price: number): number {
  return Math.round(price * NET_MULTIPLIER);
}

/** Precio necesario para recibir un neto deseado */
export function calculateRequiredPrice(desiredNet: number): number {
  return Math.round(desiredNet / NET_MULTIPLIER);
}

export const FEE_LABELS = {
  paypal: "8% aprox.",
  platform: "5%",
  total: "13%",
} as const;
