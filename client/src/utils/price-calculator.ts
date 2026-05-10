const ONVO_FEE = 0.038;
const IVA = 0.13;
const TOTAL_FEE = ONVO_FEE + IVA;
const NET_MULTIPLIER = 1 - TOTAL_FEE; // 0.832

/** Neto que recibe el comercio (después de comisiones e IVA) */
export function calculateNetAmount(price: number): number {
  return Math.round(price * NET_MULTIPLIER);
}

/** Precio necesario para recibir un neto deseado */
export function calculateRequiredPrice(desiredNet: number): number {
  return Math.round(desiredNet / NET_MULTIPLIER);
}

export const FEE_LABELS = {
  onvo: "3.8%",
  iva: "13%",
  total: "16.8%",
} as const;
