import { Metadata } from 'next';
import DesignView from './design-view';

export const metadata: Metadata = {
  title: 'Design Critic AI — Hexa Command Centre',
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return <DesignView />;
}
