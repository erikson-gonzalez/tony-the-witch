export const GALLERY_HEIGHT_CLASS: Record<string, string> = {
  short: "aspect-[4/3]",
  medium: "aspect-square",
  tall: "aspect-[3/4]",
};

export function distributeColumns<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => {
    columns[i % cols].push(item);
  });
  return columns;
}
