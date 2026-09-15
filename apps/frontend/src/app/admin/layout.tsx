import { AdminShell } from '@/components/admin/AdminShell';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hexa Command Centre — Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
