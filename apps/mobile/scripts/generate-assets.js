const sharp = require('sharp');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets');

const VOID = { r: 5, g: 5, b: 5 };
const GOLD = { r: 212, g: 175, b: 55 };

function hexagonPoints(cx, cy, radius) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return points.map((p) => p.join(',')).join(' ');
}

async function generateIcon(size) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = Math.round(size * 0.35);
  const innerRadius = Math.round(size * 0.22);

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#050505"/>
      <polygon points="${hexagonPoints(cx, cy, radius)}" fill="none" stroke="#D4AF37" stroke-width="${Math.max(2, Math.round(size * 0.015))}"/>
      <polygon points="${hexagonPoints(cx, cy, innerRadius)}" fill="#D4AF37"/>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function generateSplash(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.round(width * 0.18);
  const innerRadius = Math.round(width * 0.11);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#050505"/>
      <polygon points="${hexagonPoints(cx, cy, radius)}" fill="none" stroke="#D4AF37" stroke-width="${Math.max(2, Math.round(width * 0.008))}"/>
      <polygon points="${hexagonPoints(cx, cy, innerRadius)}" fill="#D4AF37"/>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function generateNotificationIcon(size) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = Math.round(size * 0.35);
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#6366F1"/>
      <polygon points="${hexagonPoints(cx, cy, radius)}" fill="#FFFFFF"/>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function main() {
  const icon = await generateIcon(1024);
  await sharp(icon).toFile(path.join(ASSETS_DIR, 'icon.png'));

  const adaptiveIcon = await generateIcon(1024);
  await sharp(adaptiveIcon).toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'));

  const splash = await generateSplash(1242, 2208);
  await sharp(splash).toFile(path.join(ASSETS_DIR, 'splash.png'));

  const notificationIcon = await generateNotificationIcon(96);
  await sharp(notificationIcon).toFile(path.join(ASSETS_DIR, 'notification-icon.png'));

  const favicon = await generateIcon(32);
  await sharp(favicon).toFile(path.join(ASSETS_DIR, 'favicon.png'));

  console.log('Generated mobile app store assets in', ASSETS_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
