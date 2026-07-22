import { CanvasTexture, RepeatWrapping } from 'three';

/**
 * Generates a 512×512 texture: white stone with dark fracture cracks.
 * Used as the alpha map for the outer stone shell so the wireframe core
 * shows through the gaps.
 */
export function createFractureTexture(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2D context');

  // Base dark stone
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);

  // Crack network
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  for (let i = 0; i < 120; i++) {
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    const segments = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < segments; j++) {
      x += (Math.random() - 0.5) * 180;
      y += (Math.random() - 0.5) * 180;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Noise speckles
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const gray = Math.floor(Math.random() * 60);
    ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.15)`;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}
