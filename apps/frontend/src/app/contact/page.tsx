import type { Metadata } from 'next';
import { fetchFAQs } from '@/features/faq/lib/fetchFAQs';
import { ContactPageContent } from '@/features/contact/components/ContactPageContent';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact Us | HexaStudio',
    description:
      'Get in touch with HEXA Studio. Whether you have a project in mind or want to explore possibilities, our architects are ready to bring your vision to life.',
  };
}

export default async function ContactPage() {
  const { faqs } = await fetchFAQs();
  return <ContactPageContent faqs={faqs} />;
}
