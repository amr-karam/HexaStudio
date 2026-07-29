import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const AccountingContent = dynamic(
  () => import('./AccountingContent'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" />
      </div>
    ),
    ssr: false,
  },
);

export default function AccountingPage() {
  return <AccountingContent />;
}
