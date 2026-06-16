// Generate WebP siblings for every raster image under public/{uploads,logo,assets}.
// Originals are kept on disk as a fallback; references are swapped to .webp in the app.
// Re-run any time new images are added:  node scripts/convert-to-webp.mjs
import sharp from "sharp";
import { readdirSync, statSync, existsSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

// Per-directory encode settings. maxWidth caps the largest dimension a source is
// downscaled to (never upscaled); quality is the WebP quality (0–100). `widths`, when
// present, also emits smaller responsive variants named `<base>-<w>.webp` (only widths
// strictly smaller than the source, so no upscales and no duplicate of the full size).
// lib/legacy-html.ts builds a srcset from whichever of these variants actually exist.
const DIRS = [
  { dir: "uploads", maxWidth: 1920, quality: 78, widths: [640, 1024, 1440] },
  { dir: "assets", maxWidth: 512, quality: 85 },
  { dir: "logo", maxWidth: 256, quality: 82 },
];

// Leave the social card as PNG — some link-preview scrapers still prefer PNG/JPEG.
const SKIP = new Set(["og-image.png"]);

const RASTER = new Set([".png", ".jpg", ".jpeg"]);

let converted = 0;
let srcBytes = 0;
let outBytes = 0;

for (const { dir, maxWidth, quality, widths } of DIRS) {
  const abs = join(PUBLIC, dir);
  if (!existsSync(abs)) continue;
  for (const name of readdirSync(abs)) {
    if (SKIP.has(name)) continue;
    const ext = extname(name).toLowerCase();
    if (!RASTER.has(ext)) continue;
    // Skip our own generated responsive variants (e.g. hero_1-640.webp would have a .webp
    // ext anyway, but guard against re-processing if a source happens to match the pattern).
    const input = join(abs, name);
    const base = input.slice(0, -ext.length);
    const output = base + ".webp";
    const before = statSync(input).size;
    const srcWidth = (await sharp(input).metadata()).width || maxWidth;
    await sharp(input)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toFile(output);
    const after = statSync(output).size;
    converted += 1;
    srcBytes += before;
    outBytes += after;

    // Responsive variants: only widths strictly smaller than the source (never upscale,
    // never duplicate the full-size webp). These let lib/legacy-html.ts emit a real srcset.
    for (const w of widths || []) {
      if (w >= srcWidth) continue;
      const vout = `${base}-${w}.webp`;
      await sharp(input)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality, effort: 5 })
        .toFile(vout);
      converted += 1;
      outBytes += statSync(vout).size;
    }
  }
}

const kb = (n) => (n / 1024).toFixed(0);
console.log(`Converted ${converted} images`);
console.log(`Source total: ${kb(srcBytes)} KB`);
console.log(`WebP total:   ${kb(outBytes)} KB`);
console.log(`Saved:        ${kb(srcBytes - outBytes)} KB (${Math.round((1 - outBytes / srcBytes) * 100)}% smaller)`);
