import FlowdeckClient from './FlowdeckClient';

export const revalidate = 3600;

export default function FlowdeckPage() {
  return <FlowdeckClient />;
}
