import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect any requests for /login to the canonical /portal/login route
  redirect('/portal/login');
}
