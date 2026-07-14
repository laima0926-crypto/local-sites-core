// Astro integration: build-time optimisation of customer-uploaded images.
//
// Customers upload photos straight off their phones (3-8 MB JPEGs, multi-MB
// PNG logos). Those land in public/, which Astro deliberately ships untouched,
// so every visitor used to download the originals. This hook runs after the
// static build and fixes that in dist/ without any component changes:
//
//   1. Finds <img> tags in built HTML whose src is a local /images/* or
//      /logo/* jpg/jpeg/png file.
//   2. Generates WebP variants at capped widths (never upscaling).
//   3. Rewrites the tag: WebP src + srcset/sizes, width/height (no layout
//      shift), loading="lazy" + decoding="async" unless the component already
//      chose eager (heroes do).
//
// Originals stay on disk untouched: og:image and any direct links keep
// working. Re-running is safe (variants are regenerated, rewritten tags are
// matched by their variant src and left consistent).
//
// Usage (astro.config.mjs):
//   import optimizeImages from 'local-sites-core/images';
//   export default defineConfig({ integrations: [tailwind(), optimizeImages()] });
//
// sharp comes from the consuming site's node_modules (Astro depends on it).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const PHOTO_WIDTHS = [480, 960, 1440];
const LOGO_WIDTHS = [160, 320];
const WEBP_QUALITY = 78;
const LOCAL_IMG_RE = /^\/(images|logo)\/[^"']+\.(jpe?g|png)$/i;

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(p, out);
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function parseAttrs(tag) {
  const attrs = new Map();
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(tag))) attrs.set(m[1], m[2]);
  return attrs;
}

async function makeVariants(sharp, distDir, src, widths) {
  const abs = path.join(distDir, src);
  if (!fs.existsSync(abs)) return null;
  const image = sharp(abs).rotate(); // respect EXIF orientation (phone photos)
  const meta = await image.metadata();
  // EXIF rotation can swap the effective width/height
  const swapped = meta.orientation && meta.orientation >= 5;
  const fullW = (swapped ? meta.height : meta.width) || 0;
  const fullH = (swapped ? meta.width : meta.height) || 0;
  if (!fullW || !fullH) return null;

  const targets = [...new Set(widths.map((w) => Math.min(w, fullW)))].sort((a, b) => a - b);
  const parsed = path.parse(src);
  const variants = [];
  for (const w of targets) {
    // Root-absolute URL path, e.g. /images/opt/IMG_1-480.webp
    const rel = path.posix.join(parsed.dir, 'opt', `${parsed.name}-${w}.webp`);
    if (!rel.startsWith('/')) throw new Error(`unexpected variant path: ${rel}`);
    const outAbs = path.join(distDir, rel);
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    await sharp(abs).rotate().resize({ width: w }).webp({ quality: WEBP_QUALITY }).toFile(outAbs);
    variants.push({ rel, width: w });
  }
  const largest = variants[variants.length - 1];
  const displayH = Math.round((largest.width / fullW) * fullH);
  return { variants, width: largest.width, height: displayH };
}

export async function optimizeDist(distDir, logger = console) {
  // Resolve sharp from the SITE's node_modules (Astro depends on it), not from
  // this package's own tree — core may be installed as a symlink (file: dep)
  // where relative resolution would miss the consumer's dependencies.
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    try {
      sharp = createRequire(path.join(process.cwd(), 'package.json'))('sharp');
    } catch {
      logger.warn('[images] sharp not found - skipping image optimisation.');
      return;
    }
  }

  const htmlFiles = walkHtml(distDir);
  const cache = new Map(); // src -> variant info (each image processed once)
  let rewritten = 0;

  for (const file of htmlFiles) {
    let html = fs.readFileSync(file, 'utf8');
    const tags = html.match(/<img\s[^>]*>/g) || [];
    for (const tag of tags) {
      const attrs = parseAttrs(tag);
      const src = attrs.get('src') || '';
      if (!LOCAL_IMG_RE.test(src)) continue;

      if (!cache.has(src)) {
        const widths = src.startsWith('/logo/') ? LOGO_WIDTHS : PHOTO_WIDTHS;
        cache.set(src, await makeVariants(sharp, distDir, src, widths));
      }
      const info = cache.get(src);
      if (!info) continue;

      attrs.set('src', info.variants[info.variants.length - 1].rel);
      if (info.variants.length > 1) {
        attrs.set('srcset', info.variants.map((v) => `${v.rel} ${v.width}w`).join(', '));
        // Logos render small and width-capped; photos can span the viewport.
        if (!attrs.has('sizes')) attrs.set('sizes', src.startsWith('/logo/') ? '200px' : '100vw');
      }
      if (!attrs.has('width')) { attrs.set('width', String(info.width)); attrs.set('height', String(info.height)); }
      if (!attrs.has('loading')) attrs.set('loading', 'lazy');
      if (!attrs.has('decoding')) attrs.set('decoding', 'async');

      const rebuilt = '<img ' + [...attrs.entries()].map(([k, v]) => `${k}="${v}"`).join(' ') + '>';
      html = html.split(tag).join(rebuilt);
      rewritten++;
    }
    fs.writeFileSync(file, html);
  }

  let saved = 0;
  for (const [src, info] of cache) {
    if (!info) continue;
    const orig = fs.statSync(path.join(distDir, src)).size;
    const best = fs.statSync(path.join(distDir, info.variants[info.variants.length - 1].rel)).size;
    saved += Math.max(0, orig - best);
  }
  logger.info(`[images] ${cache.size} image(s) optimised, ${rewritten} tag(s) rewritten, ~${(saved / 1024 / 1024).toFixed(1)} MB lighter per full-size view.`);
}

export default function optimizeImages() {
  return {
    name: 'local-sites-core/images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        await optimizeDist(fileURLToPath(dir), logger);
      },
    },
  };
}
