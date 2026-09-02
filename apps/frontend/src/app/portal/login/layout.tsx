import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Login',
  description: 'Secure access to your HexaStudio project gateway and client portal.',
  openGraph: {
    title: 'HexaStudio Client Login',
    description: 'Secure access to your project gateway.',
    url: 'https://hexastudio.net/portal/login',
    type: 'website',
    images: [
      {
        url: 'https://hexastudio.net/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HexaStudio Client Login',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HexaStudio Client Login',
    description: 'Secure access to your project gateway.',
    images: ['https://hexastudio.net/og-image.png'],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-sl-void">{children}</div>;
}
