const CATEGORY_TO_KEY: Record<string, string> = {
  All: "all",
  "Tattoo Gift Cards": "tattooGiftCards",
  Otros: "otros",
  Apparel: "apparel",
  Art: "art",
  Tatuajes: "tatuajes",
  Pinturas: "pinturas",
  Cinematografía: "cinematografia",
};

/** Get i18n key for a category label, e.g. "categories.apparel" */
export function getCategoryKey(category: string): string {
  const key = CATEGORY_TO_KEY[category];
  return key ? `categories.${key}` : category;
}
