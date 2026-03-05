/** Standard nav cards: only image editable in admin, title/subtitle from translations */
export type NavCardType = "portfolio" | "shop" | "contact" | "instagram" | null;

export function getNavCardType(href: string): NavCardType {
  if (!href) return null;
  if (href === "/portfolio" || href.startsWith("/portfolio")) return "portfolio";
  if (href === "/shop" || href.startsWith("/shop")) return "shop";
  if (href.startsWith("https://wa.me/")) return "contact";
  if (href.includes("instagram.com")) return "instagram";
  return null;
}

export function isStandardNavCard(href: string): boolean {
  return getNavCardType(href) !== null;
}
