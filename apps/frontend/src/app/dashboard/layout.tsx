import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | HEXA Studio',
  description: 'Your project dashboard for HexaStudio client services.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
