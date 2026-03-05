/** Query param to add reservation and go to cart. Shareable link: /cart?reserva=1 */
export const RESERVA_QUERY = "reserva=1";

export function getReservationShareUrl(): string {
  if (typeof window === "undefined") return "/cart?reserva=1";
  return `${window.location.origin}/cart?${RESERVA_QUERY}`;
}
