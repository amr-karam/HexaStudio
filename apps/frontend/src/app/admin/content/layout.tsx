import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content — Hexa Command Centre',
  robots: { index: false, follow: false },
};

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
