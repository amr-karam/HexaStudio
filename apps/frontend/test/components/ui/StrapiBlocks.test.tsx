import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StrapiBlocks } from '@/components/ui/StrapiBlocks';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: Record<string, unknown>) => {
    const { fill: _f, ...rest } = props;
    return <img src={src as string} alt={alt as string} {...rest} />;
  },
}));

describe('StrapiBlocks', () => {
  it('returns null for empty content', () => {
    const { container } = render(<StrapiBlocks content={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null for non-array content', () => {
    const { container } = render(<StrapiBlocks content={'not-array' as unknown as unknown[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders paragraph block', () => {
    const content = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Hello paragraph' }],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('Hello paragraph')).toBeInTheDocument();
  });

  it('renders heading block with correct level', () => {
    const content = [
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'My Heading' }],
      },
    ];
    render(<StrapiBlocks content={content} />);
    const heading = screen.getByText('My Heading');
    expect(heading.tagName).toBe('H2');
  });

  it('renders heading level 3', () => {
    const content = [
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: 'H3 Title' }],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('H3 Title').tagName).toBe('H3');
  });

  it('renders bold text', () => {
    const content = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Bold text', bold: true }],
      },
    ];
    render(<StrapiBlocks content={content} />);
    const strong = screen.getByText('Bold text');
    expect(strong.tagName).toBe('STRONG');
  });

  it('renders italic text', () => {
    const content = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Italic text', italic: true }],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('Italic text').tagName).toBe('EM');
  });

  it('renders code inline', () => {
    const content = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'const x = 1', code: true }],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('const x = 1').tagName).toBe('CODE');
  });

  it('renders quote block', () => {
    const content = [
      {
        type: 'quote',
        children: [{ type: 'text', text: 'A wise quote' }],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('A wise quote').closest('blockquote')).toBeInTheDocument();
  });

  it('renders code block', () => {
    const content = [
      {
        type: 'code',
        children: [{ type: 'text', text: 'console.log("hi")' }],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('console.log("hi")').tagName).toBe('CODE');
  });

  it('renders image block', () => {
    const content = [
      {
        type: 'image',
        url: 'https://example.com/image.jpg',
        caption: 'My Caption',
        alternativeText: 'Alt text',
        children: [],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('My Caption')).toBeInTheDocument();
    expect(screen.getByAltText('Alt text')).toBeInTheDocument();
  });

  it('renders image without caption', () => {
    const content = [
      {
        type: 'image',
        url: 'https://example.com/image.jpg',
        alternativeText: 'No caption image',
        children: [],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByAltText('No caption image')).toBeInTheDocument();
  });

  it('renders link block', () => {
    const content = [
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', text: 'Click me' }],
      },
    ];
    render(<StrapiBlocks content={content} />);
    const link = screen.getByText('Click me').closest('a');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders unordered list', () => {
    const content = [
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'Item one' }],
          },
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'Item two' }],
          },
        ],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('Item one')).toBeInTheDocument();
    expect(screen.getByText('Item two')).toBeInTheDocument();
  });

  it('renders ordered list', () => {
    const content = [
      {
        type: 'list',
        format: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'First item' }],
          },
        ],
      },
    ];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('First item')).toBeInTheDocument();
  });

  it('renders plain string content', () => {
    const content = ['Just a plain string'];
    render(<StrapiBlocks content={content} />);
    expect(screen.getByText('Just a plain string')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const content = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Test' }],
      },
    ];
    const { container } = render(<StrapiBlocks content={content} className="my-custom" />);
    expect(container.firstChild).toHaveClass('my-custom');
  });
});
