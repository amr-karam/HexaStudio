'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import { RadialGlow } from '@/components/animation';
import { cn } from '@/lib/utils';
import { useFAQs } from '@/features/faq/hooks/useFAQs';
import { useLocale } from '@/i18n/LocaleProvider';
import { FAQResponse } from '@hexastudio/types';

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

  const faqs = (data?.faqs && data.faqs.length > 0 ? data.faqs : fallbackFAQs).map((item: { question: string; answer: string | Array<{ text?: string }> }) => ({
    question: item.question,
    answer: typeof item.answer === 'string' ? item.answer : (item.answer as Array<{ text?: string }>).map(b => b.text || '').join(''),
  }));

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
          {faqs.map((faq, idx) => (
            <ScrollFadeIn key={idx} delay={idx * 0.05}>
              <div className="border border-border/50 rounded-xl overflow-hidden hover:border-accent/20 transition-colors duration-300">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-start"
                >
                  <span className="text-base font-medium text-foreground pe-4">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: openIndex === idx ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-accent text-xl flex-shrink-0"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-5 text-sm text-neutral-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
