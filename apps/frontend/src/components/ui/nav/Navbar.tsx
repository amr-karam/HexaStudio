import type { NavLinkItem } from './NavbarClient';
import { NavbarClient } from './NavbarClient';

export const NAV_STRUCTURE: NavLinkItem[] = [
  {
    label: 'Portfolio',
    href: '/projects',
    dropdown: {
      label: 'Portfolio',
      items: [
        { label: 'Residential', href: '/projects?category=residential', description: 'Luxury homes & villas' },
        { label: 'Commercial', href: '/projects?category=commercial', description: 'Offices, retail & mixed-use' },
        { label: 'Hospitality', href: '/projects?category=hospitality', description: 'Hotels, resorts & spas' },
        { label: 'Urban Planning', href: '/projects?category=urban', description: 'Master planning & landscape' },
        { label: 'All Projects', href: '/projects', description: 'View complete archive' },
      ],
    },
  },
  {
    label: 'Services',
    href: '/services',
    dropdown: {
      label: 'Services',
      items: [
        { label: 'Architectural Viz', href: '/services#arch-viz', description: 'Photorealistic rendering' },
        { label: '3D Modeling', href: '/services#modeling', description: 'Detailed digital twins' },
        { label: 'Animation', href: '/services#animation', description: 'Cinematic walkthroughs' },
        { label: 'Interactive 3D', href: '/services#interactive', description: 'Real-time WebGL experiences' },
        { label: '360° Tours', href: '/services#tours', description: 'Immersive panoramic tours' },
      ],
    },
  },
  { label: 'Blog', href: '/blog' },
  {
    label: 'Studio',
    href: '/about',
    dropdown: {
      label: 'Studio',
      items: [
        { label: 'About Us', href: '/about', description: 'Our story & philosophy' },
        { label: 'Team', href: '/about#team', description: 'The people behind the work' },
        { label: 'Careers', href: '/careers', description: 'Join our creative team' },
      ],
    },
  },
  { label: 'Contact', href: '/contact' },
  { label: 'Design System', href: '/design-system' },
];

export function Navbar() {
  return (
    <div aria-hidden="false">
      <NavbarClient navItems={NAV_STRUCTURE} />
    </div>
  );
}
