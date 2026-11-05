// Generates the resized WebP files the site serves, plus app/photos.json which maps
// each original to its variants. Originals are left untouched.
//
// Run `npm run images` after adding or replacing a photo, then commit the results.
// Photos are found automatically: any "/images/..." or "/videos/posters/..." path in app/.
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const outDir = join(root, "public/images/opt");
const manifestPath = join(root, "app/photos.json");

const WIDTHS = [640, 1024, 1600];
const MAX_WIDTH = 1600;
const MAX_WIDE_WIDTH = 2000; // landscape photos can run the full width of a large screen
const QUALITY = 82;

// Shown edge to edge, so these keep a larger top size.
const FULL_BLEED = { "/images/studio-hero.jpg": 1920, "/images/maison-hero3.jpeg": 1920 };

// Link previews on WhatsApp and social apps need a small JPEG at this exact size.
const SOCIAL_SOURCE = "/images/maison-hero.png";

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return /\.(tsx?|css)$/.test(entry.name) ? [path] : [];
    }),
  );
  return nested.flat();
}

async function referencedPhotos() {
  const files = await sourceFiles(join(root, "app"));
  const text = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  const matches = text.matchAll(/\/(?:images|videos\/posters)\/[^"'`)\s]+\.(?:png|jpe?g)/gi);
  const photos = new Set([...matches].map((match) => match[0]));
  return [...photos].filter((src) => !src.startsWith("/images/opt/")).sort();
}

const publicPath = (src) => join(root, "public", src);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const manifest = {};
for (const src of await referencedPhotos()) {
  const name = basename(src, extname(src));
  const metadata = await sharp(publicPath(src)).metadata();
  const { width: sourceWidth, height: sourceHeight } = metadata.autoOrient ?? metadata;
  const ratio = sourceWidth / sourceHeight;
  const top = Math.min(sourceWidth, FULL_BLEED[src] ?? (ratio > 1.2 ? MAX_WIDE_WIDTH : MAX_WIDTH));
  const widths = [...WIDTHS.filter((width) => width < top), top];

  for (const width of widths) {
    await sharp(publicPath(src))
      .rotate()
      .resize({ width })
      .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
      .toFile(join(outDir, `${name}-${width}.webp`));
  }
  manifest[src] = { base: `/images/opt/${name}`, widths, ratio: Number(ratio.toFixed(3)) };
}

await sharp(publicPath(SOCIAL_SOURCE))
  .resize({ width: 1200, height: 630, fit: "cover" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(join(outDir, "social-share.jpg"));

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Optimized ${Object.keys(manifest).length} photos into public/images/opt`);
