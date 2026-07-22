import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPage } from '@/features/pages/lib/fetchPages';
import { StrapiBlocks } from '@/components/ui/StrapiBlocks';
import { Button } from '@/components/ui/Button';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('terms');

  if (!page) {
    return {
      title: 'Terms of Service | HexaStudio',
      description:
        'HexaStudio terms of service — conditions for using our website and services.',
    };
  }

  return {
    title: page.seoTitle || `${page.title} | HexaStudio`,
    description:
      page.seoDescription ||
      'HexaStudio terms of service — conditions for using our website and services.',
  };
}

export default async function TermsPage() {
  const page = await fetchPage('terms');

  return (
    <main className="min-h-screen bg-background pt-40 pb-32 relative">
      {/* Subtle background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/3 blur-[200px] rounded-full pointer-events-none" />

      <div className="w-full px-8 md:px-16 relative z-10">
        <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono">
          Legal
        </span>
        <div className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground mb-16 leading-tight">
          Terms of <span className="italic text-accent">Service</span>
        </div>

        {page?.content && page.content.length > 0 ? (
          <div className="max-w-3xl">
            <StrapiBlocks content={page.content} />
          </div>
        ) : (
          /* Fallback content when CMS page is not available */
          <div className="max-w-3xl flex flex-col gap-8 text-neutral-400 font-light leading-relaxed text-base">
            <p className="text-lg text-neutral-300">
              By accessing or using the HexaStudio website and services, you
              agree to be bound by these terms. If you do not agree, please do
              not use our services.
            </p>

            <div className="pt-6 border-t border-border/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-foreground font-medium mb-4">
                Intellectual Property
              </h2>
              <p>
                All visual content, 3D models, renderings, and materials
                produced by HexaStudio remain our intellectual property until
                full payment is received. Upon payment, clients receive a
                license for the intended use.
              </p>
            </div>

            <div className="pt-6 border-t border-border/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-foreground font-medium mb-4">
                Project Scope
              </h2>
              <p>
                Project timelines, deliverables, and revisions are defined in
                the project agreement. Any changes to scope may affect timelines
                and pricing.
              </p>
            </div>

            <div className="pt-6 border-t border-border/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-foreground font-medium mb-4">
                Limitation of Liability
              </h2>
              <p>
                HexaStudio is not liable for indirect damages arising from the
                use of our services. Our total liability is limited to the
                amount paid for the same project.
              </p>
            </div>

            <div className="pt-6 border-t border-border/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-foreground font-medium mb-4">
                Contact
              </h2>
              <p>
                For questions about these terms, email us at{' '}
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
