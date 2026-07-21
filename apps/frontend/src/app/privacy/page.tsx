import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPage } from '@/features/pages/lib/fetchPages';
import { StrapiBlocks } from '@/components/ui/StrapiBlocks';
import { Button } from '@/components/ui/Button';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('privacy');

  if (!page) {
    return {
      title: 'Privacy Policy | HexaStudio',
      description:
        'HexaStudio privacy policy — how we collect, use, and protect your data.',
    };
  }

  return {
    title: page.seoTitle || `${page.title} | HexaStudio`,
    description:
      page.seoDescription ||
      'HexaStudio privacy policy — how we collect, use, and protect your data.',
  };
}

export default async function PrivacyPage() {
  const page = await fetchPage('privacy');

  return (
    <main className="min-h-screen bg-background pt-40 pb-32 relative">
      {/* Subtle background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/3 blur-[200px] rounded-full pointer-events-none" />

      <div className="w-full px-8 md:px-16 relative z-10">
        <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono">
          Legal
        </span>
        <div className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground mb-16 leading-tight">
          Privacy <span className="italic text-accent">Policy</span>
        </div>

        {page?.content && page.content.length > 0 ? (
          <div className="max-w-3xl">
            <StrapiBlocks content={page.content} />
          </div>
        ) : (
          /* Fallback content when CMS page is not available */
          <div className="max-w-3xl flex flex-col gap-8 text-neutral-400 font-light leading-relaxed text-base">
            <p className="text-lg text-neutral-300">
              This privacy policy explains how HexaStudio collects, uses, and
              protects your personal information when you visit our website or
              use our services.
            </p>

            <div className="pt-6 border-t border-border/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-foreground font-medium mb-4">
                Information We Collect
              </h2>
              <p>
                We collect information you provide directly, such as your name,
                email address, and project details when you contact us through
                our website.
              </p>
            </div>

            <div className="pt-6 border-t border-border/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-foreground font-medium mb-4">
                How We Use Your Information
              </h2>
              <p>
                Your information is used solely to respond to your inquiries,
                provide our visualization services, and improve our website
                experience. We do not sell or share your personal data with third
                parties.
              </p>
            </div>

            <div className="pt-6 border-t border-border/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-foreground font-medium mb-4">
                Data Security
              </h2>
              <p>
                We implement industry-standard security measures to protect your
                data. However, no method of transmission over the internet is
                100% secure.
              </p>
            </div>

            <div className="pt-6 border-t border-border/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-foreground font-medium mb-4">
                Contact
              </h2>
              <p>
                For questions about this policy, email us at{' '}
                <a
                  href="mailto:info@hexastudio.net"
                  className="text-accent hover:underline transition-colors duration-300"
                >
                  info@hexastudio.net
                </a>
                .
              </p>
            </div>
          </div>
        )}

        <div className="pt-12 mt-8 border-t border-border/20 max-w-3xl">
          <Link href="/">
            <Button variant="outline" size="lg">
              &larr; Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
