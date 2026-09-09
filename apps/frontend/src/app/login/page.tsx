import { createMetadata } from '@/lib/seo';


export const metadata = createMetadata({
  title: 'Login',
  description:
    'Sign in to the HexaStudio client portal to access your project dashboard, approvals, and deliverables.',
  path: '/login',
});

import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect any requests for /login to the canonical /portal/login route
  redirect('/portal/login');
}
