'use client';

import { useRef, useEffect, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

interface TrailDot {
  x: number;
  y: number;
  life: number;
  size: number;
  opacity: number;
}

export default function CursorTrail() {
  const [mounted, setMounted] = useState(false);
  const { animationsEnabled, finePointer } = useMotionPolicy();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const trails = useRef<TrailDot[]>([]);
  const rafIdRef = useRef<number>(0);
  
  useEffect(() => { setMounted(true); }, []);
  
  // Don't render until client-side mount
  if (!mounted) return null;
  if (!finePointer || !animationsEnabled) return null;

  useEffect(() => {
    // Gate: only run on fine-pointer devices with animations enabled
    if (!finePointer || !animationsEnabled) return;

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
      trails.current.push({
        x: e.clientX,
        y: e.clientY,
        life: 1,
        size: 2 + Math.random() * 2,
        opacity: 0.6 + Math.random() * 0.4,
      });
      if (trails.current.length > 30) trails.current.shift();
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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

      rafIdRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);
    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      // Clear the canvas trail on cleanup
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      trails.current = [];
    };
  }, [animationsEnabled, finePointer, mouseX, mouseY]);

  // Don't mount canvas at all on coarse pointer or when animations disabled
  if (!finePointer || !animationsEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      aria-hidden="true"
    />
  );
}
