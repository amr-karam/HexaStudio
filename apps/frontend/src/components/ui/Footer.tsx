'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import { Magnetic } from '@/components/ui/Magnetic';
import dynamic from 'next/dynamic';
const ContactRibbon = dynamic(
  () => import('@/components/ui/ContactRibbon').then((m) => m.ContactRibbon),
  { ssr: false }
);
import { useLocale } from '@/i18n/LocaleProvider';

const linkVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
      delay: 0.05 * i,
    },
  }),
};

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/hexastudio' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/hexastudio' },
  { name: 'Behance', href: 'https://behance.net/hexastudio' },
  { name: 'Vimeo', href: 'https://vimeo.com/hexastudio' },
];

export const Footer = () => {
  const { t } = useLocale();
  const currentYear = new Date().getFullYear();

  const groupedNav = {
    Studio: [
      { name: t('navbar.portfolio'), href: '/projects' },
      { name: t('navbar.services'), href: '/services' },
      { name: t('navbar.studio'), href: '/about' },
    ],
    Resources: [
      { name: t('navbar.blog'), href: '/blog' },
      { name: 'Case Studies', href: '/case-studies' },
      { name: 'White Papers', href: '/white-papers' },
      { name: 'Press Kit', href: '/press' },
    ],
    Company: [
      { name: t('navbar.contact'), href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Partners', href: '/partners' },
    ],
  };

  return (
    <footer className="relative overflow-hidden border-t border-[rgba(212,175,55,0.10)] bg-sl-void text-sl-alabaster">
      {/* ── Silent Luxury atmosphere — radial gold glows like Services/Hero ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,175,55,0.06),transparent_55%)]" />
        <div className="absolute -top-[28%] right-[8%] h-[55%] w-[42%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05),transparent_60%)] blur-[90px]" />
        <div className="absolute bottom-0 left-1/2 h-px w-[92%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.16)] to-transparent" />
      </div>

      <ContactRibbon />

      {/* ── Editorial CTA band — Bodoni display + gold hairline rule + Magnetic CTA ── */}
      <div className="relative border-y border-[rgba(212,175,55,0.08)] bg-sl-obsidian/40 backdrop-blur-[12px]">
        {/* subtle inner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.04),transparent_70%)]"
        />
        <ScrollFadeIn className="relative px-4 sm:px-8 md:px-16 py-8 md:py-14">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end md:gap-12">
            <h2 className="max-w-[20ch] font-serif text-[clamp(1.75rem,4vw,2.85rem)] font-light leading-[0.92] tracking-tight text-sl-alabaster sm:max-w-none">
              Let&apos;s build —{' '}
              <span className="font-serif italic font-light tracking-tight text-sl-gold-hover">
                something extraordinary
              </span>
              <span className="text-sl-gold-hover/80">.</span>
            </h2>
            <Magnetic>
              <Link
                href="/contact"
                aria-label={String(t('footer.startProject'))}
                className="group relative inline-flex shrink-0 items-center gap-3 border border-[rgba(212,175,55,0.18)] px-7 py-3.5 font-mono text-xs uppercase tracking-[0.35em] text-sl-alabaster transition-all duration-500 hover:border-[rgba(212,175,55,0.32)] hover:bg-[rgba(212,175,55,0.06)] hover:text-sl-alabaster focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sl-void)]"
              >
                <span>{t('footer.startProject')}</span>
                <span
                  aria-hidden="true"
                  className="text-sm leading-none transition-transform duration-500 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </Magnetic>
          </div>
        </ScrollFadeIn>
      </div>

      {/* ── Main 12-col editorial grid — 5-3-2-2 — increased rhythm ── */}
      <ScrollFadeIn className="relative px-4 sm:px-8 md:px-16 py-20 md:py-24 lg:py-28">
        {/* Decorative gold corner hairlines — Vogue folio */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-6 top-8 hidden h-20 w-20 md:block lg:left-8"
        >
          <span className="absolute left-0 top-0 h-12 w-px bg-gradient-to-b from-[rgba(212,175,55,0.18)] to-transparent" />
          <span className="absolute left-0 top-0 h-px w-12 bg-gradient-to-r from-[rgba(212,175,55,0.18)] to-transparent" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-8 hidden h-20 w-20 md:block lg:right-8"
        >
          <span className="absolute right-0 top-0 h-12 w-px bg-gradient-to-b from-[rgba(212,175,55,0.18)] to-transparent" />
          <span className="absolute right-0 top-0 h-px w-12 bg-gradient-to-l from-[rgba(212,175,55,0.18)] to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Brand — 5 cols */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <Link
              href="/"
              className="group flex w-fit items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sl-void)]"
            >
              <Image
                src="/logo.svg"
                alt="HexaStudio Logo"
                width={22}
                height={22}
                className="transition-transform duration-700 group-hover:rotate-90"
              />
              <span className="font-serif text-[13px] font-light uppercase tracking-[0.35em] text-sl-alabaster">
                Hexa<span className="font-serif italic font-light tracking-[0.35em] text-sl-alabaster">Studio</span>
              </span>
            </Link>
            <p className="max-w-md font-sans text-sm font-light leading-relaxed text-sl-mist/60 md:text-[15px] md:leading-[1.75]">
              {t('footer.tagline')}
            </p>
            {/* fine gold accent */}
            <div className="mt-1 flex items-center gap-3" aria-hidden="true">
              <span className="h-px w-8 bg-[rgba(212,175,55,0.20)]" />
              <span className="h-1 w-1 rotate-45 bg-[rgba(212,175,55,0.35)] shadow-[0_0_10px_rgba(212,175,55,0.25)]" />
              <span className="h-px w-8 bg-gradient-to-r from-[rgba(212,175,55,0.20)] to-transparent" />
            </div>
          </div>

          {/* Navigation — grouped links — 3 cols */}
          <div className="flex flex-col gap-10 lg:col-span-3">
            <span className="font-mono text-xs uppercase tracking-[0.4em] text-sl-silver">
              {t('footer.navigation')}
            </span>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {Object.entries(groupedNav).map(([group, links]) => (
                <div key={group} className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-sl-silver/70 mb-1">{group}</span>
                  {links.map((item, i) => (
                    <motion.div
                      key={item.href}
                      custom={i}
                      variants={linkVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      <Link
                        href={item.href}
                        className="group relative inline-flex w-fit py-0.5 font-sans text-sm font-light text-sl-mist/60 transition-colors duration-500 hover:text-sl-gold-hover focus-visible:outline-none focus-visible:text-sl-gold-hover"
                      >
                        <span>{item.name}</span>
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 left-0 h-px w-full origin-center scale-x-0 bg-[rgba(212,175,55,0.45)] transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legal — 2 cols — mono */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <span className="font-mono text-xs uppercase tracking-[0.4em] text-sl-silver">
              {t('footer.legal')}
            </span>
            <div className="flex flex-col gap-1">
              {['/privacy', '/terms'].map((href, i) => (
                <motion.div
                  key={href}
                  custom={i + 5}
                  variants={linkVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Link
                    href={href}
                    className="group relative inline-flex w-fit py-1.5 font-mono text-xs tracking-[0.14em] text-sl-mist/60 transition-colors duration-500 hover:text-sl-gold-hover focus-visible:outline-none focus-visible:text-sl-gold-hover"
                  >
                    <span>{href === '/privacy' ? t('footer.privacy') : t('footer.terms')}</span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-px w-full origin-center scale-x-0 bg-[rgba(212,175,55,0.35)] transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Connect — 2 cols — external arrow */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <span className="font-mono text-xs uppercase tracking-[0.4em] text-sl-silver">
              {t('footer.connect')}
            </span>
            <div className="flex flex-col gap-1">
              {socialLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  custom={i + 7}
                  variants={linkVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.name} — opens in new tab`}
                    className="group inline-flex w-fit items-center gap-2 py-1.5 font-sans text-sm font-light text-sl-mist/60 transition-colors duration-500 hover:text-sl-gold-hover focus-visible:outline-none focus-visible:text-sl-gold-hover focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sl-void)]"
                  >
                    <span>{link.name}</span>
                    <span
                      aria-hidden="true"
                      className="text-[11px] leading-none opacity-40 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Centered diamond divider — gold hairline */}
        <div aria-hidden="true" className="mt-16 flex items-center gap-4 md:mt-24">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(212,175,55,0.16)]" />
          <div className="h-1.5 w-1.5 rotate-45 bg-[rgba(212,175,55,0.32)] shadow-[0_0_12px_rgba(212,175,55,0.22)]" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(212,175,55,0.16)]" />
        </div>

        {/* Bottom bar — gold divider, mono © + Bodoni italic mantra */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.6 }}
          className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[rgba(212,175,55,0.08)] pt-8 md:flex-row md:gap-6"
        >
          <p className="text-center font-mono text-xs uppercase tracking-[0.32em] text-sl-mist/60 md:text-left">
            &copy; {currentYear} HexaStudio. {t('footer.rights')}
          </p>
          <p className="font-serif text-xs font-light italic tracking-[0.18em] text-sl-mist/60 md:text-[13px]">
            Precision — Purpose — Vision
          </p>
        </motion.div>
      </ScrollFadeIn>
    </footer>
  );
};
