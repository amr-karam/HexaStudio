'use client';

import { useRef, useEffect } from 'react';
import { useMotionValue } from 'framer-motion';

interface TrailDot {
  x: number;
  y: number;
  life: number;
  size: number;
  opacity: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const trails = useRef<TrailDot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      // Add new trail dot
      trails.current.push({
        x: e.clientX,
        y: e.clientY,
        life: 1,
        size: 2 + Math.random() * 2,
        opacity: 0.6 + Math.random() * 0.4,
      });
      // Cap trail length
      if (trails.current.length > 30) trails.current.shift();
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw trails
      for (let i = trails.current.length - 1; i >= 0; i--) {
        const dot = trails.current[i];
        dot.life -= 0.03;
        dot.size *= 0.97;

        if (dot.life <= 0) {
          trails.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${dot.opacity * dot.life})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [mouseX, mouseY]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      aria-hidden="true"
    />
  );
}
