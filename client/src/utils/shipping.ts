import type { CartItem } from "@/lib/cart";
import type { ShippingZone, ShippingMethod } from "@/types";

export type { ShippingZone, ShippingMethod };

/** Gift cards are digital - no shipping needed */
export function isGiftCard(item: CartItem): boolean {
  return item.slug.startsWith("tattoo-gift-card-");
}

/** Custom session (user enters amount) - no shipping, in-person payment */
export function isCustomSession(item: CartItem): boolean {
  return item.slug === "sesion-tattoo-custom";
}

/** Cart needs shipping when it has physical items (not reservation, not gift card, not custom session) */
export function needsShipping(items: CartItem[]): boolean {
  return items.some((i) => !i.isReservation && !isGiftCard(i) && !isCustomSession(i));
}

/** Default shipping costs in colones (CRC); admin can override via site config */
export const SHIPPING_COSTS = {
  GAM: { STANDARD: 2500, NEXT_DAY: 5000 },
  NON_GAM: { STANDARD: 3500 },
  INTERNATIONAL: { A_CONVENIR: 0 },
} as const;

export interface ShippingConfig {
  gamStandard?: number;
  gamNextDay?: number;
  nonGamStandard?: number;
}

export function getShippingCost(
  zone: ShippingZone,
  method: ShippingMethod,
  shipping?: ShippingConfig
): number {
  if (zone === "INTERNATIONAL") return 0;
  if (zone === "GAM") {
    return method === "STANDARD"
      ? shipping?.gamStandard ?? SHIPPING_COSTS.GAM.STANDARD
      : shipping?.gamNextDay ?? SHIPPING_COSTS.GAM.NEXT_DAY;
  }
  return shipping?.nonGamStandard ?? SHIPPING_COSTS.NON_GAM.STANDARD;
}

export function getAvailableMethods(zone: ShippingZone): ShippingMethod[] {
  if (zone === "INTERNATIONAL") return ["A_CONVENIR"];
  return zone === "GAM" ? ["STANDARD", "NEXT_DAY"] : ["STANDARD"];
}

export function isNextDayDynamic(zone: ShippingZone, method: ShippingMethod): boolean {
  return zone === "GAM" && method === "NEXT_DAY";
}

export function isInternational(zone: ShippingZone): boolean {
  return zone === "INTERNATIONAL";
}

export function formatColones(amount: number): string {
  return `₡${amount.toLocaleString("es-CR")}`;
}
