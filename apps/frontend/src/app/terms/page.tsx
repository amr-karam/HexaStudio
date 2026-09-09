import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPage } from '@/features/pages/lib/fetchPages';
import { StrapiBlocks } from '@/components/ui/StrapiBlocks';
import { Button } from '@/components/ui/Button';
import { siteTitleSegment } from '@/lib/site-title';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('terms');

  const title = page?.seoTitle ? siteTitleSegment(page.seoTitle) : page?.title ?? 'Terms of Service';
  const description =
    page?.seoDescription ||
    'HexaStudio terms of service — conditions for using our website and services.';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | HexaStudio`,
      description,
      url: 'https://hexastudio.net/terms',
      type: 'website',
      images: [
        {
          url: 'https://hexastudio.net/logo.svg',
          width: 1200,
          height: 630,
          alt: 'HexaStudio Terms of Service',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | HexaStudio`,
      description,
      images: ['https://hexastudio.net/logo.svg'],
    },
  };
}

export default async function TermsPage() {
  const page = await fetchPage('terms');

  return (
    <div className="min-h-screen bg-sl-void pt-24 pb-24 md:pt-40 md:pb-32 relative">
      {/* Subtle background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sl-gold-subtle/3 blur-[200px] rounded-full pointer-events-none" />

      <div className="w-full px-4 sm:px-8 md:px-16 relative z-10">
        <span className="text-xs uppercase tracking-[0.5em] text-sl-mist/60 mb-6 block font-mono">
          Legal
        </span>
        <div className="text-5xl md:text-7xl font-serif font-light tracking-tight text-sl-alabaster mb-16 leading-tight">
          Terms of <span className="italic text-sl-gold-hover">Service</span>
        </div>

        {page?.content && page.content.length > 0 ? (
          <div className="max-w-3xl">
            <StrapiBlocks content={page.content} />
          </div>
        ) : (
          /* Fallback content when CMS page is not available */
          <div className="max-w-3xl flex flex-col gap-8 text-sl-mist/60 font-light leading-relaxed text-base">
            <p className="text-lg text-sl-mist/80">
              By accessing or using the HexaStudio website and services, you
              agree to be bound by these terms. If you do not agree, please do
              not use our services.
            </p>

            <div className="pt-6 border-t border-sl-silver/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-sl-alabaster font-medium mb-4">
                Intellectual Property
              </h2>
              <p>
                All visual content, 3D models, renderings, and materials
                produced by HexaStudio remain our intellectual property until
                full payment is received. Upon payment, clients receive a
                license for the intended use.
              </p>
            </div>

            <div className="pt-6 border-t border-sl-silver/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-sl-alabaster font-medium mb-4">
                Project Scope
              </h2>
              <p>
                Project timelines, deliverables, and revisions are defined in
                the project agreement. Any changes to scope may affect timelines
                and pricing.
              </p>
            </div>

            <div className="pt-6 border-t border-sl-silver/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-sl-alabaster font-medium mb-4">
                Limitation of Liability
              </h2>
              <p>
                HexaStudio is not liable for indirect damages arising from the
                use of our services. Our total liability is limited to the
                amount paid for the same project.
              </p>
            </div>

            <div className="pt-6 border-t border-sl-silver/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-sl-alabaster font-medium mb-4">
                Contact
              </h2>
              <p>
                For questions about these terms, email us at{' '}
                <a
                  href="mailto:info@hexastudio.net"
                  className="text-sl-gold-hover hover:underline transition-colors duration-300"
                >
                  info@hexastudio.net
                </a>
                .
              </p>
            </div>
          </div>
        )}

        <div className="pt-12 mt-8 border-t border-sl-silver/20 max-w-3xl">
          <Link href="/">
            <Button variant="outline" size="lg">
              &larr; Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
