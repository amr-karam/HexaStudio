import React from 'react';
import Image from 'next/image';

interface StrapiTextNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

interface StrapiBlock {
  type: string;
  children: (StrapiTextNode | StrapiBlock)[];
  level?: number;
  format?: 'ordered' | 'unordered' | string;
  url?: string;
  caption?: string;
  alternativeText?: string;
  language?: string;
}

function renderText(node: StrapiTextNode, index: number): React.ReactNode {
  let text: React.ReactNode = node.text;

  if (node.bold) text = <strong key={index}>{text}</strong>;
  if (node.italic) text = <em key={index}>{text}</em>;
  if (node.underline) text = <u key={index}>{text}</u>;
  if (node.strikethrough) text = <s key={index}>{text}</s>;
  if (node.code) {
    text = (
      <code key={index} className="px-1.5 py-0.5 bg-neutral-800/50 rounded text-accent text-sm font-mono">
        {text}
      </code>
    );
  }

  return text;
}

function renderInlineNodes(
  children: (StrapiTextNode | StrapiBlock)[],
  parentKey: string
): React.ReactNode {
  return children.map((child, idx) => {
    if (child.type === 'text') {
      return renderText(child as StrapiTextNode, idx);
    }
    return renderBlock(child as StrapiBlock, `${parentKey}-${idx}`);
  });
}

function renderBlock(block: StrapiBlock, key: string): React.ReactNode {
  const children = renderInlineNodes(block.children ?? [], key);

  switch (block.type) {
    case 'paragraph':
      return (
        <p key={key} className="text-neutral-400 font-light leading-relaxed text-lg">
          {children}
        </p>
      );

    case 'heading': {
      const level = block.level ?? 2;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const sizeClass =
        level === 1
          ? 'text-4xl md:text-5xl'
          : level === 2
            ? 'text-3xl md:text-4xl'
            : level === 3
              ? 'text-2xl md:text-3xl'
              : 'text-xl md:text-2xl';

      return (
        <Tag
          key={key}
          className={`${sizeClass} font-serif font-light text-foreground tracking-tight mt-12 mb-6`}
        >
          {children}
        </Tag>
      );
    }

    case 'list': {
      const Tag = block.format === 'ordered' ? 'ol' : 'ul';
      const listClass =
        block.format === 'ordered'
          ? 'list-decimal list-inside'
          : 'space-y-2';

      return (
        <Tag key={key} className={`${listClass} text-neutral-400 font-light text-lg`}>
          {(block.children ?? []).map((item, idx) => {
            if (item.type === 'list-item' || item.type === 'list') {
              return (
                <li key={idx} className="flex items-start gap-3">
                  {block.format !== 'ordered' && (
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2.5 shrink-0" />
                  )}
                  <span>{renderInlineNodes((item as StrapiBlock).children ?? [], `${key}-${idx}`)}</span>
                </li>
              );
            }
            return <li key={idx}>{renderText(item as StrapiTextNode, idx)}</li>;
          })}
        </Tag>
      );
    }

    case 'quote':
      return (
        <blockquote
          key={key}
          className="border-l-2 border-accent pl-6 my-8 text-neutral-300 italic text-xl font-light"
        >
          {children}
        </blockquote>
      );

    case 'code':
      return (
        <pre
          key={key}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 my-8 overflow-x-auto"
        >
          <code className="text-sm font-mono text-neutral-300">
            {block.children?.map((c) => (c as StrapiTextNode).text ?? '').join('')}
          </code>
        </pre>
      );

    case 'image':
      if (!block.url) return null;
      return (
        <figure key={key} className="my-8">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={block.url}
              alt={block.alternativeText || block.caption || ''}
              fill
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-neutral-500 font-light">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'link':
      return (
        <a
          key={key}
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-4 hover:text-accent-light transition-colors"
        >
          {children}
        </a>
      );

    default:
      return (
        <div key={key} className="text-neutral-400">
          {children}
        </div>
      );
  }
}

interface StrapiBlocksProps {
  content: unknown[];
  className?: string;
}

export function StrapiBlocks({ content, className }: StrapiBlocksProps) {
  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-6 ${className ?? ''}`}>
      {content.filter(Boolean).map((block, idx) => {
        if (typeof block === 'string') {
          return <p key={idx} className="text-neutral-400 font-light leading-relaxed text-lg">{block}</p>;
        }
        return renderBlock(block as StrapiBlock, `block-${idx}`);
      })}
    </div>
  );
}
