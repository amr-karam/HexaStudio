import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '@/components/ui/cards/Card';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img alt={props.alt as string} src={props.src as string} />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
      <div className={className} {...props}>{children}</div>
    ),
    article: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
      <article className={className} {...props}>{children}</article>
    ),
    section: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
      <section className={className} {...props}>{children}</section>
    ),
  },
}));

describe('Card', () => {
  it('renders with a title', () => {
    render(<Card title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with a description', () => {
    render(<Card description="A description" />);
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Card>
        <span>Child content</span>
      </Card>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders as a div by default', () => {
    const { container } = render(<Card title="Test" />);
    expect(container.querySelector('div.relative')).toBeTruthy();
  });

  it('renders as an article when as="article"', () => {
    render(<Card as="article" title="Article Card" />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders as a section when as="section"', () => {
    render(<Card as="section" title="Section Card" />);
    // sections don't have an implicit role, query by tag name
    const section = document.querySelector('section');
    expect(section).toBeTruthy();
  });

  it('renders an image when image prop is provided', () => {
    render(<Card title="With Image" image="/test.jpg" />);
    const img = screen.getByAltText('With Image');
    expect(img).toHaveAttribute('src', '/test.jpg');
  });

  it('uses title as image alt text', () => {
    render(<Card title="My Project" image="/img.png" />);
    expect(screen.getByAltText('My Project')).toBeInTheDocument();
  });

  it('uses fallback alt text when no title', () => {
    render(<Card image="/img.png" />);
    expect(screen.getByAltText('Project image')).toBeInTheDocument();
  });

  it('does not render image section when no image prop', () => {
    const { container } = render(<Card title="No Image" />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('applies the featured variant by default', () => {
    const { container } = render(<Card title="Test" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('from-surface-light');
  });

  it('applies the minimal variant', () => {
    const { container } = render(<Card title="Test" variant="minimal" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-transparent');
  });

  it('applies the glass variant', () => {
    const { container } = render(<Card title="Test" variant="glass" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('artisan-glass');
  });

  it('applies the solid variant', () => {
    const { container } = render(<Card title="Test" variant="solid" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-surface-dark');
  });

  it('applies the luxury variant', () => {
    const { container } = render(<Card title="Test" variant="luxury" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-accent/20');
  });

  it('applies hover styles by default', () => {
    const { container } = render(<Card title="Test" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('hover:');
  });

  it('disables hover styles when hover={false}', () => {
    const { container } = render(<Card title="Test" hover={false} />);
    const card = container.firstChild as HTMLElement;
    // featured variant hover class should not be present
    expect(card.className).not.toContain('hover:border-gold/30');
  });

  it('merges custom className', () => {
    const { container } = render(<Card title="Test" className="custom-class" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('custom-class');
  });

  it('renders title as h3 heading', () => {
    render(<Card title="Heading Test" />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Heading Test');
  });

  it('renders without title or description (children only)', () => {
    render(
      <Card>
        <p>Just children</p>
      </Card>
    );
    expect(screen.getByText('Just children')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).toBeNull();
  });
});
