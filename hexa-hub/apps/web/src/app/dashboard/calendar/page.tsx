import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const CalendarContent = dynamic(
  () => import('./CalendarContent'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" />
      </div>
    ),
    ssr: false,
  },
);

export default function CalendarPage() {
  return <CalendarContent />;
}
