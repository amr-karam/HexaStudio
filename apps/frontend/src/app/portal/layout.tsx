import type { Metadata } from 'next';
import { PortalNav } from '@/features/portal/PortalNav';

export const metadata: Metadata = {
  title: 'Client Portal | HexaStudio',
  description: 'Your exclusive gateway to project progress and deliverables.',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PortalNav />
      {children}
    </>
  );
}
