import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPage } from '@/features/pages/lib/fetchPages';
import { StrapiBlocks } from '@/components/ui/StrapiBlocks';
import { Button } from '@/components/ui/Button';
import { siteTitleSegment } from '@/lib/site-title';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('privacy');

  const title = page?.seoTitle ? siteTitleSegment(page.seoTitle) : page?.title ?? 'Privacy Policy';
  const description =
    page?.seoDescription ||
    'HexaStudio privacy policy — how we collect, use, and protect your data.';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | HexaStudio`,
      description,
      url: 'https://hexastudio.net/privacy',
      type: 'website',
      images: [
        {
          url: 'https://hexastudio.net/logo.svg',
          width: 1200,
          height: 630,
          alt: 'HexaStudio Privacy Policy',
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

export default async function PrivacyPage() {
  const page = await fetchPage('privacy');

  return (
    <div className="min-h-screen bg-sl-void pt-24 pb-24 md:pt-40 md:pb-32 relative">
      {/* Subtle background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sl-gold-subtle/3 blur-[200px] rounded-full pointer-events-none" />

      <div className="w-full px-4 sm:px-8 md:px-16 relative z-10">
        <span className="text-xs uppercase tracking-[0.5em] text-sl-mist/60 mb-6 block font-mono">
          Legal
        </span>
        <div className="text-5xl md:text-7xl font-serif font-light tracking-tight text-sl-alabaster mb-16 leading-tight">
          Privacy <span className="italic text-sl-gold-hover">Policy</span>
        </div>

        {page?.content && page.content.length > 0 ? (
          <div className="max-w-3xl">
            <StrapiBlocks content={page.content} />
          </div>
        ) : (
          /* Fallback content when CMS page is not available */
          <div className="max-w-3xl flex flex-col gap-8 text-sl-mist/60 font-light leading-relaxed text-base">
            <p className="text-lg text-sl-mist/80">
              This privacy policy explains how HexaStudio collects, uses, and
              protects your personal information when you visit our website or
              use our services.
            </p>

            <div className="pt-6 border-t border-sl-silver/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-sl-alabaster font-medium mb-4">
                Information We Collect
              </h2>
              <p>
                We collect information you provide directly, such as your name,
                email address, and project details when you contact us through
                our website.
              </p>
            </div>

            <div className="pt-6 border-t border-sl-silver/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-sl-alabaster font-medium mb-4">
                How We Use Your Information
              </h2>
              <p>
                Your information is used solely to respond to your inquiries,
                provide our visualization services, and improve our website
                experience. We do not sell or share your personal data with third
                parties.
              </p>
            </div>

            <div className="pt-6 border-t border-sl-silver/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-sl-alabaster font-medium mb-4">
                Data Security
              </h2>
              <p>
                We implement industry-standard security measures to protect your
                data. However, no method of transmission over the internet is
                100% secure.
              </p>
            </div>

            <div className="pt-6 border-t border-sl-silver/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-sl-alabaster font-medium mb-4">
                Contact
              </h2>
              <p>
                For questions about this policy, email us at{' '}
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
