import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Admin | HexaStudio',
  description: 'Internal management dashboard for HexaStudio operations.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
