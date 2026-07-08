import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Login | HexaStudio',
  description: 'Secure access to your project gateway.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
