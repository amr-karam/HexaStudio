import type { Metadata } from 'next';
import { fetchServices } from '@/features/services/lib/fetchServices';
import { ServicesPageContent } from '@/features/services/components/ServicesPageContent';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Services | HexaStudio',
    description: 'Professional 3D architectural visualization services — from concept to photorealistic rendering.',
  };
}

export default async function ServicesPage() {
  const data = await fetchServices();
  return <ServicesPageContent services={data.services} />;
}
