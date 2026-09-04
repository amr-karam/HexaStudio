import { Metadata } from 'next';
import { StoryScrollCarousel } from './story-scroll';

export const metadata: Metadata = {
  title: 'Story',
  description: 'A cinematic scroll-driven narrative of the project.',
};

export default function StoryPage() {
  return <StoryScrollCarousel />;
}
