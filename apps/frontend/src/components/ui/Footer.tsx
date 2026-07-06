import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/hexastudio' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/hexastudio' },
  { name: 'Behance', href: 'https://behance.net/hexastudio' },
  { name: 'Vimeo', href: 'https://vimeo.com/hexastudio' },
];

const navLinks = [
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Services', href: '/services' },
  { name: 'Studio', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border/50">
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">

          <div className="lg:col-span-5 flex flex-col gap-8">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <Image
                src="/logo.webp"
                alt="HexaStudio Logo"
                width={24}
                height={24}
                className="group-hover:rotate-90 transition-transform duration-500"
              />
              <span className="text-xs font-medium uppercase tracking-[0.4em] text-foreground">
                HexaStudio
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm font-light">
              Living Spaces. Visualized. <br className="hidden md:block" />
              Immersive 3D architectural experiences.
            </p>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Navigation
            </span>
            <div className="flex flex-col gap-3">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs text-neutral-500 hover:text-accent transition-colors duration-500 w-fit"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Connect
            </span>
            <div className="flex flex-col gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-accent transition-colors duration-500 w-fit"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600">
            &copy; {currentYear} HexaStudio. All rights reserved.
          </p>
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
            Precision &mdash; Purpose &mdash; Vision
          </p>
        </div>
      </div>
    </footer>
  );
};
