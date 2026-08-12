'use client';

import { motion, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { TextReveal } from '@/components/ui/TextReveal';
import { OrnamentalRule } from '@/components/storybook/BookOrnaments';
import { DropCap } from '@/components/storybook/DropCap';
import { cn } from '@/lib/utils';
import { velocityToSkew } from '@/lib/motion/scroll-utils';
import { useScrollVelocity, useFinePointer } from '@/hooks';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import type { Article } from '@hexastudio/types';

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 };

interface BlogPageContentProps {
  articles: Article[];
}

/**
 * Blog article card — editorial magazine layout with cover image,
 * category + read-time eyebrow, serif title, excerpt, and gold accent line.
 */
function ArticleCard({ article, _index, isFeatured }: { article: Article; _index: number; isFeatured: boolean }) {
  return (
    <article className="group block">
      <Link href={`/blog/${article.slug}`} className="block h-full">
        {/* Cover image — featured: 21:9 cinematic; standard: 16:10 editorial */}
        <div
          className={cn(
            "bg-surface-light overflow-hidden relative mb-10 transition-all duration-1000 ease-out-expo",
            isFeatured ? "aspect-[21/9]" : "aspect-[16/10]"
          )}
        >
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes={isFeatured ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 75vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
              className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700 ease-out-expo"
            />
          ) : (
            <div className="w-full h-full bg-surface-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

          {/* Hover overlay — refined "Read →" with gold accent */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/20 backdrop-blur-[2px]">
            <span className="text-xs uppercase tracking-[0.4em] text-white font-mono px-5 py-2.5 border border-white/20 rounded-sm">
              Read
              <span className="text-accent ml-1.5">→</span>
            </span>
          </div>
        </div>

        {/* Editorial metadata row */}
        <div className="flex items-center gap-4 mb-5">
          {article.category && (
            <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-accent font-mono">
              {article.category.name}
            </span>
          )}
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-neutral-600 font-mono">
            {article.readTime} min read
          </span>
          <span className="flex-1 h-px bg-border/30" aria-hidden="true" />
        </div>

        {/* Title — serif, tight tracking, gold hover */}
        <h2
          className={cn(
            "font-serif font-light text-foreground group-hover:text-accent transition-colors duration-700 leading-tight tracking-tighter",
            isFeatured ? "text-4xl md:text-5xl lg:text-6xl" : "text-xl md:text-2xl lg:text-3xl"
          )}
        >
          {article.title}
        </h2>

        {/* Excerpt — neutral, relaxed leading */}
        <p
          className={cn(
            "font-light leading-relaxed line-clamp-3 mt-5",
            isFeatured
              ? "text-lg text-neutral-400 max-w-3xl"
              : "text-sm text-neutral-500 max-w-xl"
          )}
        >
          {article.excerpt}
        </p>

        {/* Gold accent line — reveals on hover */}
        <div className="h-[1px] w-0 group-hover:w-32 bg-accent transition-all duration-700 ease-out-expo mt-6" aria-hidden="true" />
      </Link>
    </article>
  );
}

const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'fb-art-1',
    title: 'The Art of Architectural Lighting: Physics, Emotion, and Digital Realism',
    slug: 'architectural-lighting-physics-emotion',
    excerpt: 'An in-depth exploration of how photometric accuracy, light bouncing, and color temperature craft emotional spatial narratives in virtual environments.',
    content: [{ type: 'paragraph', children: [{ type: 'text', text: 'Lighting is not merely illumination; it is the soul of architecture...' }] }],
    readTime: 6,
    author: 'HexaStudio Editorial',
    tags: ['Lighting', 'Rendering', '3D Architecture'],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    category: { id: 'c1', name: 'Rendering', slug: 'rendering' },
  },
  {
    id: 'fb-art-2',
    title: 'Real-Time Raytracing vs Offline Path Tracing in Modern Architecture',
    slug: 'realtime-raytracing-vs-path-tracing',
    excerpt: 'Comparing Unreal Engine 5 Lumen with traditional V-Ray and Corona rendering pipelines for client decision-making velocity.',
    content: [{ type: 'paragraph', children: [{ type: 'text', text: 'The gap between offline path tracing and real-time GPU rendering has closed...' }] }],
    readTime: 4,
    author: 'Tech Research Team',
    tags: ['Raytracing', 'Unreal Engine', 'V-Ray'],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    category: { id: 'c2', name: 'Technology', slug: 'technology' },
  },
  {
    id: 'fb-art-3',
    title: 'Biophilic Design & The Psychology of Digital Spatial Environments',
    slug: 'biophilic-design-digital-psychology',
    excerpt: 'How natural materials, organic geometry, and dynamic solar patterns in digital models improve client engagement and wellbeing.',
    content: [{ type: 'paragraph', children: [{ type: 'text', text: 'Biophilic principles transcend physical structures into the digital realm...' }] }],
    readTime: 5,
    author: 'Design Strategy Team',
    tags: ['Biophilic', 'Spatial Design', 'Psychology'],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
    category: { id: 'c3', name: 'Spatial Design', slug: 'spatial-design' },
  },
  {
    id: 'fb-art-4',
    title: 'WebXR & Spatial Computing: The Next Frontier for Architectural Reviews',
    slug: 'webxr-spatial-computing-architectural-reviews',
    excerpt: 'How browser-native WebGL and WebXR empower global stakeholders to walk through unbuilt spaces in real-time collaboration rooms.',
    content: [{ type: 'paragraph', children: [{ type: 'text', text: 'Spatial computing is shifting architectural reviews from passive screen viewing to active immersion...' }] }],
    readTime: 7,
    author: 'Innovation Lab',
    tags: ['WebXR', 'Spatial Computing', 'VR'],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
    category: { id: 'c4', name: 'Innovation', slug: 'innovation' },
  },
  {
    id: 'fb-art-5',
    title: 'Material Physics in UE5: Subsurface Scattering and Micro-Displacement',
    slug: 'material-physics-ue5-subsurface-scattering',
    excerpt: 'Technical guide to rendering translucent marble, brushed metals, and aged concrete textures with physical accuracy.',
    content: [{ type: 'paragraph', children: [{ type: 'text', text: 'True photorealism lives in micro-imperfections and complex light transport...' }] }],
    readTime: 8,
    author: '3D Materials Team',
    tags: ['PBR', 'Materials', 'Shaders'],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1200&q=80',
    category: { id: 'c5', name: 'Craft', slug: 'craft' },
  },
];

export function BlogPageContent({ articles }: BlogPageContentProps) {
  // demilie.ru / cuberto DNA: velocity shear on the blog card grid.
  const { staticMode } = useMotionPolicy();
  const finePointer = useFinePointer();
  const velocity = useScrollVelocity();
  const skewY = useTransform(velocity, (v) => velocityToSkew(v, 3));
  const enableShear = !staticMode && finePointer;
  const displayArticles = articles.length > 0 ? articles : FALLBACK_ARTICLES;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 overflow-hidden">
      {/* Atmospheric depth */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="gradient-radial-gold" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(212,175,55,0.02) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative z-10 px-8 md:px-16">
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <header className="mb-28 md:mb-36 relative">
          {/* Ornamental rule above eyebrow */}
          <div className="mb-8" aria-hidden="true">
            <OrnamentalRule />
          </div>

          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-8 block font-mono"
          >
            Thoughts & Insights
          </motion.span>

          {/* Title — cinematic serif with reveal */}
          <div className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-foreground leading-[0.88] tracking-tighter mb-10">
            <TextReveal delay={0.1}>
              The Architectural
              <br />
              <span className="italic text-accent" style={{ fontFamily: '"Playfair Display", serif' }}>
                Journal
              </span>
            </TextReveal>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_TRANSITION, delay: 0.1 }}
            className="text-neutral-400 font-light text-lg md:text-xl leading-relaxed w-full max-w-3xl border-l-2 border-accent/30 pl-6"
          >
            Exploring the intersection of spatial design, real-time technology, and the
            emotional impact of architectural visualization.
          </motion.p>

          {/* Ornamental rule below subtitle */}
          <div className="mt-10" aria-hidden="true">
            <OrnamentalRule />
          </div>
        </header>

        {/* ── Article Grid ────────────────────────────────────────────────────── */}
        <motion.div
          style={enableShear ? { skewY } : undefined}
          className="will-change-transform"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-28">
            {displayArticles.map((article, idx) => {
              const isFeatured = idx === 0;
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ ...SPRING_TRANSITION, delay: 0.06 * idx }}
                  className={cn(
                    "group block",
                    isFeatured ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4"
                  )}
                >
                  <ArticleCard article={article} _index={idx} isFeatured={isFeatured} />

                  {/* Storybook-style divider between articles (not after featured) */}
                  {!isFeatured && idx > 0 && (
                    <div className="hidden lg:block absolute top-0 left-0 -translate-x-1/2 w-[50%] pointer-events-none" aria-hidden="true">
                      <OrnamentalRule />
                    </div>
                  )}

                  {/* Drop cap lead-in for featured article */}
                  {isFeatured && idx === 0 && (
                    <p className="mt-12 storybook-body font-light text-neutral-400 leading-relaxed max-w-3xl border-l-2 border-accent/30 pl-6">
                      <DropCap>
                        {displayArticles[0].excerpt.slice(0, 120)}...
                      </DropCap>
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Bottom ornamental rule ───────────────────────────────────────────── */}
        <div className="mt-24 mb-8" aria-hidden="true">
          <OrnamentalRule />
        </div>

        {/* ── Newsletter teaser ────────────────────────────────────────────────── */}
        <div className="max-w-2xl border-t border-border/30 pt-12">
          <p className="text-neutral-500 font-light text-sm leading-relaxed text-center">
            New essays on spatial design and architectural visualization —{' '}
            <span className="text-accent font-medium">delivered occasionally.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
