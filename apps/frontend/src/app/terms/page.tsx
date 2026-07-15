import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { TextReveal } from '@/components/ui/TextReveal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'HexaStudio terms of service — conditions for using our website and services.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background pt-40 pb-32">
      <div className="w-full px-8 md:px-16">
        <FadeIn delay={0}>
          <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono">
            Legal
          </span>
        </FadeIn>
        <div className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground mb-12 leading-tight">
          <TextReveal delay={0.1}>
            Terms of <span className="italic text-accent">Service</span>
          </TextReveal>
        </div>
        <div className="flex flex-col gap-8 text-neutral-400 font-light leading-relaxed text-base">
          <p>
            By accessing or using the HexaStudio website and services, you agree to be bound by these terms. If you do not agree, please do not use our services.
          </p>
          <h2 className="text-lg uppercase tracking-widest text-foreground font-medium pt-4 border-t border-border/30">Intellectual Property</h2>
          <p>
            All visual content, 3D models, renderings, and materials produced by HexaStudio remain our intellectual property until full payment is received. Upon payment, clients receive a license for the intended use.
          </p>
          <h2 className="text-lg uppercase tracking-widest text-foreground font-medium pt-4 border-t border-border/30">Project Scope</h2>
          <p>
            Project timelines, deliverables, and revisions are defined in the project agreement. Any changes to scope may affect timelines and pricing.
          </p>
          <h2 className="text-lg uppercase tracking-widest text-foreground font-medium pt-4 border-t border-border/30">Limitation of Liability</h2>
          <p>
            HexaStudio is not liable for indirect damages arising from the use of our services. Our total liability is limited to the amount paid for the same project.
          </p>
          <h2 className="text-lg uppercase tracking-widest text-foreground font-medium pt-4 border-t border-border/30">Contact</h2>
          <p>
            For questions about these terms, email us at <a href="mailto:info@hexastudio.net" className="text-accent hover:underline">info@hexastudio.net</a>.
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
