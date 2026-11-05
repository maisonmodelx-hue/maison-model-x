import photos from "./photos.json";

const manifest: Record<string, { base: string; widths: number[]; ratio: number }> = photos;

// Largest optimized version no wider than maxWidth. A photo that hasn't been
// through `npm run images` yet falls back to its original file.
export function photoSrc(src: string, maxWidth = Infinity) {
  const photo = manifest[src];
  if (!photo) return src;
  const width = photo.widths.filter((w) => w <= maxWidth).at(-1) ?? photo.widths[0];
  return `${photo.base}-${width}.webp`;
}

export function photoSrcSet(src: string) {
  const photo = manifest[src];
  return photo?.widths.map((w) => `${photo.base}-${w}.webp ${w}w`).join(", ");
}

// Width divided by height. Unprocessed photos get a portrait frame until `npm run images` runs.
export function photoRatio(src: string) {
  return manifest[src]?.ratio ?? 0.8;
}
