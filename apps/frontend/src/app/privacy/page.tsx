import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { TextReveal } from '@/components/ui/TextReveal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'HexaStudio privacy policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background pt-40 pb-32">
      <div className="max-w-3xl mx-auto px-8 md:px-16">
        <FadeIn delay={0}>
          <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono">
            Legal
          </span>
        </FadeIn>
        <div className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground mb-12 leading-tight">
          <TextReveal delay={0.1}>
            Privacy <span className="italic text-accent">Policy</span>
          </TextReveal>
        </div>
        <div className="flex flex-col gap-8 text-neutral-400 font-light leading-relaxed text-base">
          <p>
            This privacy policy explains how HexaStudio collects, uses, and protects your personal information when you visit our website or use our services.
          </p>
          <h2 className="text-lg uppercase tracking-widest text-foreground font-medium pt-4 border-t border-border/30">Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your name, email address, and project details when you contact us through our website.
          </p>
          <h2 className="text-lg uppercase tracking-widest text-foreground font-medium pt-4 border-t border-border/30">How We Use Your Information</h2>
          <p>
            Your information is used solely to respond to your inquiries, provide our visualization services, and improve our website experience. We do not sell or share your personal data with third parties.
          </p>
          <h2 className="text-lg uppercase tracking-widest text-foreground font-medium pt-4 border-t border-border/30">Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
          </p>
          <h2 className="text-lg uppercase tracking-widest text-foreground font-medium pt-4 border-t border-border/30">Contact</h2>
          <p>
            For questions about this policy, email us at <a href="mailto:info@hexastudio.net" className="text-accent hover:underline">info@hexastudio.net</a>.
          </p>
          <div className="pt-12">
            <Link href="/" className="text-xs uppercase tracking-widest text-accent hover:underline font-mono">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
