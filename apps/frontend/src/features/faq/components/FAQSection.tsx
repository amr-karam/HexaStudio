'use client';

import React, { useState, useCallback } from 'react';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import { RadialGlow } from '@/components/animation';
import { useFAQs } from '@/features/faq/hooks/useFAQs';
import { useLocale } from '@/i18n/LocaleProvider';
import { FAQResponse } from '@hexastudio/types';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { cn } from '@/lib/utils';

const fallbackFAQs = [
  { question: 'What types of projects do you specialize in?', answer: 'We specialize in high-end architectural visualization including residential, commercial, hospitality, and cultural projects. Our expertise spans from concept visualization to photorealistic renders and interactive 3D experiences.' },
  { question: 'How long does a typical project take?', answer: 'Project timelines vary based on complexity. A standard visualization takes 2-4 weeks, while complex interactive 3D experiences may take 6-10 weeks. We provide detailed timelines during our initial consultation.' },
  { question: 'Do you work with international clients?', answer: 'Absolutely. We work with architects, developers, and design firms worldwide. Our team spans multiple time zones and we have experience with projects across Europe, Asia, and the Americas.' },
  { question: 'What file formats do you deliver?', answer: 'We deliver in all standard formats including high-resolution images (PNG, JPEG, TIFF), videos (MP4, MOV), 3D models (FBX, OBJ, GLTF), and interactive web experiences. Format selection depends on your specific needs.' },
  { question: 'Can you integrate with our existing BIM workflow?', answer: 'Yes. We work with Revit, ArchiCAD, SketchUp, and other BIM tools. We can import your models directly and build upon your existing design data to create stunning visualizations.' },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLocale();
  const { data } = useFAQs() as { data: FAQResponse | undefined };
  const { staticMode } = useMotionPolicy();

  const faqs = (data?.faqs && data.faqs.length > 0 ? data.faqs : fallbackFAQs).map((item: { question: string; answer: string | Array<{ text?: string }> }) => ({
    question: item.question,
    answer: typeof item.answer === 'string' ? item.answer : (item.answer as Array<{ text?: string }>).map(b => b.text || '').join(''),
  }));

  const toggleFaq = useCallback((idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section className="px-8 md:px-16 py-32 bg-surface border-t border-border/50">
      <RadialGlow color="#D4AF37" size={400} top="-100px" right="-100px" blur={50} opacity={0.08} />
      <div className="max-w-4xl mx-auto">
        <ScrollFadeIn className="mb-20 text-center">
          <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block">
            {t('footer.legal')}
          </span>
          <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground leading-tight">
            Frequently Asked <span className="italic text-accent">Questions</span>
          </h2>
        </ScrollFadeIn>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <ScrollFadeIn key={idx} delay={idx * 0.05}>
                <div className="border border-border/50 rounded-xl overflow-hidden hover:border-accent/20 transition-colors duration-300">
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-6 py-5 text-start"
                  >
                    <span className="text-base font-medium text-foreground pe-4">{faq.question}</span>
                    <span
                      className={cn(
                        'text-accent text-xl flex-shrink-0 transition-transform duration-300',
                        isOpen && 'rotate-45',
                      )}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                  {/* CSS grid-template-rows approach — compositor-friendly, no JS measurement */}
                  <div
                    className="grid transition-all"
                    style={{
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                      transitionDuration: staticMode ? '0ms' : '300ms',
                      transitionTimingFunction: staticMode ? 'step-end' : 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-5 text-sm text-neutral-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollFadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};
