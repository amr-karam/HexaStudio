'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import SeasonPresetControls from '@/components/SeasonPresetControls';
import { getRamadanPreset, type ScenePreset } from '@/lib/presets/SeasonPresetLibrary';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import * as THREE from 'three';

const GOLDEN_ANGLE = 137.508;
const MONOLITH_COUNT = 24;
/** Cursor lag time-constant (s) — the mass trails ~0.2s behind the pointer. */
const CURSOR_LAG = 0.2;

interface CursorTarget {
  x: number;
  y: number;
}

interface MonolithProps {
  index: number;
  target: { current: CursorTarget };
  animated: boolean;
}

function Monolith({ index, target, animated }: MonolithProps) {
  const groupRef = useRef<THREE.Group>(null);
  // Smoothed cursor — each monolith eases its own copy toward the target so
  // the whole spiral feels like one floating mass trailing the pointer.
  const smooth = useRef<CursorTarget>({ x: 0.5, y: 0.5 });

  const radius = 80 + index * 14;
  const angle = (index * GOLDEN_ANGLE * Math.PI) / 180;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius * 0.3;
  const z = Math.sin(index * 0.7) * 40;
  const w = 20 + (index % 3) * 12;
  const h = 40 + (index % 5) * 20;
  const d = 8 + (index % 2) * 6;
  const rot = angle + Math.PI / 4;

  const shade = 1 - (z + 80) / 160;
  const alpha = Math.max(0.05, Math.min(0.9, shade));

  const boxGeo = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  // EdgesGeometry must wrap its own BoxGeometry instance — reusing boxGeo
  // corrupts the edge buffer on PC (missing lines / flickering wireframes).
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), [w, h, d]);
  const ringGeo = useMemo(() => new THREE.RingGeometry(8, 12, 24), []);
  const fillMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xD4AF37,
        transparent: true,
        opacity: 0.08 + alpha * 0.12,
        side: THREE.DoubleSide,
      }),
    [alpha],
  );
  const edgeMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0xD4AF37,
        transparent: true,
        opacity: 0.15 + alpha * 0.2,
      }),
    [alpha],
  );
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xD4AF37,
        transparent: true,
        opacity: 0.3 + alpha * 0.4,
        side: THREE.DoubleSide,
      }),
    [alpha],
  );

  useEffect(
    () => () => {
      boxGeo.dispose();
      edgeGeo.dispose();
      ringGeo.dispose();
      fillMat.dispose();
      edgeMat.dispose();
      ringMat.dispose();
    },
    [boxGeo, edgeGeo, ringGeo, fillMat, edgeMat, ringMat],
  );

  useFrame((state, delta) => {
    if (!animated || !groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Exponential ease toward the pointer — 1 - e^(-dt/τ) ≈ 0.2s lag at 60fps.
    const k = 1 - Math.exp(-delta / CURSOR_LAG);
    smooth.current.x += (target.current.x - smooth.current.x) * k;
    smooth.current.y += (target.current.y - smooth.current.y) * k;

    const cosR = Math.cos(rot + t * 0.05);
    const sinR = Math.sin(rot + t * 0.05);

    const xR = x * cosR + z * sinR;
    const zR = -x * sinR + z * cosR;
    const screenX = xR - zR * 0.35;
    const screenY = y - zR * 0.2;

    const cx = (smooth.current.x - 0.5) * 60;
    const cy = (smooth.current.y - 0.5) * 40;

    groupRef.current.position.x = screenX + cx;
    groupRef.current.position.y = -screenY + cy;
    groupRef.current.position.z = zR + Math.sin(t * 0.3 + x * 0.01) * 8;
    groupRef.current.rotation.y = rot + t * 0.05;
  });

  return (
    <group ref={groupRef} position={[x, -y, z]}>
      <mesh geometry={boxGeo} material={fillMat} />
      <lineSegments geometry={edgeGeo} material={edgeMat} />
      <mesh geometry={ringGeo} material={ringMat} position={[0, -h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}

interface VoidGardenProps {
  target: { current: CursorTarget };
  animated: boolean;
  /** Seasonal light tint — shared source of truth with the /studio viewer. */
  sun: string;
  rim: string;
}

function VoidGarden({ target, animated, sun, rim }: VoidGardenProps) {
  return (
    <>
      {Array.from({ length: MONOLITH_COUNT }, (_, i) => (
        <Monolith key={i} index={i} target={target} animated={animated} />
      ))}
      <ambientLight intensity={0.1} />
      <directionalLight position={[100, 100, 50]} intensity={0.3} color={sun} />
      <directionalLight position={[-100, -100, -50]} intensity={0.2} color={rim} />
    </>
  );
}

export function NewHomeHero() {
  const { animationsEnabled, finePointer } = useMotionPolicy();
  // Pointer target lives in a ref — mousemove never re-renders React.
  const target = useRef<CursorTarget>({ x: 0.5, y: 0.5 });
  const [activePreset, setActivePreset] = useState<ScenePreset>(() => getRamadanPreset());

  useEffect(() => {
    if (!animationsEnabled || !finePointer) return;
    const handleMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX / window.innerWidth;
      target.current.y = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [animationsEnabled, finePointer]);

  return (
    <section
      id="ch-vision"
      className="relative min-h-screen w-full overflow-hidden bg-void"
      aria-label="HEXA STUDIO — Architectural Visualization"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(212,175,55,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,175,55,0.03) 0%, transparent 50%)',
        }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1600px] grid-cols-1 items-center gap-12 px-6 py-20 sm:px-10 md:grid-cols-12 md:gap-16 md:px-16 md:py-32">
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[10px] uppercase tracking-wide text-text-muted"
          >
            <span className="inline-block h-px w-8 align-middle bg-gold/40 mr-3" />
            ARCHITECTURAL SPATIAL INTELLIGENCE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 font-serif text-[clamp(2.75rem,8vw,7rem)] font-light leading-[0.9] tracking-tight text-text-primary"
          >
            Living
            <br />
            <span className="text-gold-bright">Spaces</span>
            <br />
            Visualized.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 max-w-md text-sm font-light leading-relaxed text-text-muted/60 sm:text-base"
          >
            We render the spaces the world has not yet seen — photoreal, cinematic,
            built from the same light that will one day fall on the real thing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <Link href="/projects" data-cursor="explore">
              <Button variant="primary" size="lg" className="min-h-[52px] min-w-[200px]">
                View the Work
              </Button>
            </Link>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-wide text-text-muted/60 transition-colors duration-500 hover:text-gold-bright"
            >
              <span className="inline-block h-px w-8 bg-text-muted/30 transition-all duration-500 group-hover:w-12 group-hover:bg-gold/50" />
              Begin a project
            </Link>
          </motion.div>
        </div>

        <div className="relative md:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-[480px]">
            <div className="pointer-events-none absolute inset-0 border border-gold/10" />
            <div className="pointer-events-none absolute inset-2 border border-gold/6" />

            {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => {
              const map: Record<typeof corner, string> = {
                tl: 'top-0 left-0 border-t border-l',
                tr: 'top-0 right-0 border-t border-r',
                bl: 'bottom-0 left-0 border-b border-l',
                br: 'bottom-0 right-0 border-b border-r',
              };
              return (
                <span
                  key={corner}
                  className={`pointer-events-none absolute h-3 w-3 border-gold/50 ${map[corner]}`}
                />
              );
            })}

            <Canvas
              camera={{ position: [0, 0, 200], fov: 40 }}
              gl={{
                antialias: true,
                alpha: true,
                stencil: false,
                depth: true,
                powerPreference: 'high-performance',
              }}
              dpr={[1, 1.5]}
              frameloop={animationsEnabled ? 'always' : 'demand'}
              style={{ width: '100%', height: '100%' }}
              onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace;
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.0;
              }}
            >
              <VoidGarden
                target={target}
                animated={animationsEnabled}
                sun={activePreset.lighting.directionalColor}
                rim={activePreset.lighting.hemisphereColor}
              />
            </Canvas>

            <div className="pointer-events-none absolute -bottom-8 left-0 font-mono text-[9px] uppercase tracking-wide text-text-muted/40">
              VOID GARDEN · {activePreset.theme.toUpperCase()} — MONOLITHS
            </div>
            <div className="pointer-events-none absolute -top-7 right-0 font-mono text-[9px] uppercase tracking-wide text-text-muted/40">
              8K · OCTANE · UE5
            </div>
          </div>

          {/* Seasonal light — same preset library as the /studio viewer */}
          <div className="mx-auto mt-12 flex w-full max-w-[480px] flex-col gap-3">
            <SeasonPresetControls
              onPresetChange={setActivePreset}
              activePresetId={activePreset.id}
              compact
            />
            <p className="font-mono text-[9px] uppercase leading-relaxed tracking-wide text-text-muted/40">
              {activePreset.name} — {activePreset.description}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-6 pb-6 sm:px-10 md:px-16 md:pb-8">
        <span className="font-mono text-[10px] uppercase tracking-wide text-text-muted/40">
          SCROLL
        </span>
        <div className="h-px flex-1 mx-6 bg-gradient-to-r from-gold/20 via-gold/20 to-transparent" />
        <span className="font-mono text-[10px] uppercase tracking-wide text-text-muted/40">
          CH. 02 / CRAFT ↓
        </span>
      </div>
    </section>
  );
}
