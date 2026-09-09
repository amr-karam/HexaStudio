'use client';

import React from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const INTEGRATIONS = [
  'Google',
  'OpenAI',
  'ElevenLabs',
  'Sync Labs',
  'Mistral',
  'DeepSeek',
  'PixVerse',
  'ByteDance',
  'KlingAI',
  'Black Forest Labs',
  'Topaz Labs',
  'MultiTalk',
  'HeyGen',
  'Vidu',
  'Meta',
  'xAI',
  'Lightricks',
];

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export function Integrations() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative bg-void px-6 py-24 sm:px-10 md:px-16 md:py-28">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-12 text-center md:mb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/60">
            <span className="mr-3 inline-block h-px w-8 align-middle bg-white/40" />
            Integrations
            <span className="ml-3 inline-block h-px w-8 align-middle bg-white/40" />
          </p>
          <h2 className="mt-6 font-serif text-[clamp(1.75rem,4vw,3rem)] font-light leading-[1.1] tracking-tight text-white">
            One subscription. Every image & video model.
          </h2>
        </div>

        <div className="relative flex overflow-hidden">
          <div
            className="flex w-[calc(200%+2rem)] shrink-0 items-center justify-around"
            style={
              reducedMotion
                ? undefined
                : {
                    animation: 'marquee 28s linear infinite',
                  }
            }
          >
            {[...INTEGRATIONS, ...INTEGRATIONS].map((name, idx) => (
              <span
                key={`${name}-${idx}`}
                className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.35em] text-white/40 transition-colors duration-500 hover:text-white/80"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `,
        }}
      />
    </section>
  );
}
