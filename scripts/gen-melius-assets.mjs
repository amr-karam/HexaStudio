import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const BASE = 'apps/frontend/public/media/melius';

const ASSETS = [
  { path: 'canvas-showcase/advertising/lifestyle-moment.webp', w: 1024 },
  { path: 'canvas-showcase/advertising/model.webp',           w: 1024 },
  { path: 'canvas-showcase/advertising/product-mockup.webp',  w: 1024 },
  { path: 'canvas-showcase/advertising/studio-shot.webp',     w: 1024 },
  { path: 'canvas-showcase/e-commerce/model.webp',            w: 1024 },
  { path: 'canvas-showcase/e-commerce/pack-shot.webp',        w: 1024 },
  { path: 'canvas-showcase/e-commerce/pdp-image.webp',        w: 1024 },
  { path: 'canvas-showcase/e-commerce/product-motion.webp',   w: 1024 },
  { path: 'canvas-showcase/fashion/campaign-garment.webp',    w: 1024 },
  { path: 'canvas-showcase/fashion/croquis.webp',             w: 1024 },
  { path: 'canvas-showcase/fashion/fabric-swatch.webp',       w: 1024 },
  { path: 'canvas-showcase/fashion/garment-mockup.webp',      w: 1024 },
  { path: 'canvas-showcase/filmmaking/character-study.webp',  w: 1024 },
  { path: 'canvas-showcase/filmmaking/movie-cut-1.webp',      w: 1024 },
  { path: 'canvas-showcase/filmmaking/movie-cut-2.webp',      w: 1024 },
  { path: 'canvas-showcase/filmmaking/still-sketch.webp',     w: 1024 },
  { path: 'canvas-showcase/branding/icon-01.webp',            w: 512 },
  { path: 'canvas-showcase/branding/icon-02.webp',            w: 512 },
  { path: 'canvas-showcase/branding/icon-03.webp',            w: 512 },
  { path: 'canvas-showcase/branding/icon-04.webp',            w: 512 },
  { path: 'personas/agencies.webp',                           w: 1024 },
  { path: 'personas/filmmakers.webp',                         w: 1024 },
];

(async () => {
  let count = 0;
  for (const a of ASSETS) {
    const out = `${BASE}/${a.path}`;
    mkdirSync(out.split('/').slice(0, -1).join('/'), { recursive: true });
    await sharp({
      create: {
        width: a.w,
        height: Math.round((a.w * 9) / 16),
        channels: 3,
        background: { r: 8, g: 8, b: 12 },
      },
    })
      .webp({ quality: 82 })
      .toFile(out);
    count++;
  }
  console.log('generated', count, 'placeholders');
})();
