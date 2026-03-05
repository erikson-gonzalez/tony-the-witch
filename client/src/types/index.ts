export type CheckoutStep = "cart" | "info" | "payment" | "processing" | "confirmed";

export type ShippingZone = "GAM" | "NON_GAM" | "INTERNATIONAL";
export type ShippingMethod = "STANDARD" | "NEXT_DAY" | "A_CONVENIR";

export interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  note: string;
  /** CR address - provincia, cantón, distrito, punto de referencia */
  provincia?: string;
  canton?: string;
  distrito?: string;
  puntoReferencia?: string;
  /** For international shipping */
  pais?: string;
  /** Only used when cart needs shipping */
  shippingZone?: ShippingZone;
  shippingMethod?: ShippingMethod;
  /** Required when NEXT_DAY selected - user accepts variable Uber Flash cost */
  nextDayAccepted?: boolean;
  /** Discount/promo code */
  discountCode?: string;
}

export interface CardForm {
  number: string;
  expiry: string;
  cvc: string;
  holder: string;
}

export interface NavCard {
  title: string;
  subtitle: string;
  href: string;
  external: boolean;
  image: string;
}

export interface GalleryWork {
  id: number;
  image: string;
  category: string;
  height: "short" | "medium" | "tall";
}
