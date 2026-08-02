"use client";

import React from 'react';
import Image from 'next/image';
import type { StrapiBlock } from '@/features/pages/types';

function renderBlock(block: StrapiBlock | string, key: string): React.ReactNode {
  if (typeof block === 'string') {
    return <span key={key}>{block}</span>;
  }

  // Handle 'text' nodes
  if (block.type === 'text') {
    let content: React.ReactNode = block.text || '';
    if (block.bold) content = <strong key={key}>{content}</strong>;
    if (block.italic) content = <em key={key}>{content}</em>;
    if (block.code) content = <code key={key}>{content}</code>;
    return content;
  }

  // Helper for children
  const renderChildren = (children: StrapiBlock[] = []) =>
    children.map((child, idx) => renderBlock(child, `${key}-${idx}`));

  // Handle different block types based on the StrapiBlock structure
  switch (block.type) {
    case 'paragraph': {
      return (
        <p key={key} className="text-neutral-400 font-light leading-relaxed text-lg">
          {block.children ? renderChildren(block.children) : block.text || ''}
        </p>
      );
    }

    case 'heading': {
      const level = block.level || 2;
      const sizeClass =
        level === 1
          ? 'text-4xl md:text-5xl'
          : level === 2
            ? 'text-3xl md:text-4xl'
            : level === 3
              ? 'text-2xl md:text-3xl'
              : 'text-xl md:text-2xl';
      const cls = `${sizeClass} font-serif font-light text-foreground tracking-tight mt-12 mb-6`;
      const children = block.children ? renderChildren(block.children) : block.text || '';
      if (level === 1) return <h1 key={key} className={cls}>{children}</h1>;
      if (level === 3) return <h3 key={key} className={cls}>{children}</h3>;
      if (level === 4) return <h4 key={key} className={cls}>{children}</h4>;
      return <h2 key={key} className={cls}>{children}</h2>;
    }

    case 'list': {
      const listClassBase =
        block.format === 'ordered' ? 'list-decimal list-inside' : 'space-y-2';
      const listClassName = `${listClassBase} text-neutral-400 font-light text-lg`;
      const listItems = (block.children || []).map((item, idx) => {
        return (
          <li key={idx} className="flex items-start gap-3">
            {block.format !== 'ordered' && (
              <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2.5 shrink-0" />
            )}
            <span>{renderBlock(item, `${key}-${idx}`)}</span>
          </li>
        );
      });
      if (block.format === 'ordered') return <ol key={key} className={listClassName}>{listItems}</ol>;
      return <ul key={key} className={listClassName}>{listItems}</ul>;
    }

    case 'list-item': {
      return (
        <React.Fragment key={key}>
          {block.children ? renderChildren(block.children) : block.text || ''}
        </React.Fragment>
      );
    }

    case 'quote': {
      return (
        <blockquote
          key={key}
          className="border-s-2 border-accent ps-6 my-8 text-neutral-300 italic text-xl font-light"
        >
          {block.children ? renderChildren(block.children) : block.text || ''}
        </blockquote>
      );
    }

    case 'code': {
      return (
        <div key={key} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 my-8 overflow-x-auto">
          <pre className="text-sm font-mono text-neutral-300">
            <code>{block.children ? renderChildren(block.children) : block.text || ''}</code>
          </pre>
        </div>
      );
    }

    case 'image': {
      if (!block.url) return null;
      const altText = typeof block.alternativeText === 'string' ? block.alternativeText : '';
      const captionText = typeof block.caption === 'string' ? block.caption : '';
      return (
        <figure key={key} className="my-8">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            {typeof block.url === 'string' && (
              <Image
                src={block.url}
                alt={altText || captionText || ''}
                fill
                className="object-cover"
              />
            )}
          </div>
          {captionText && (
            <figcaption className="mt-3 text-center text-sm text-neutral-500 font-light">
              {captionText}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'link': {
      if (!block.url) return null;
      return (
        <a
          key={key}
          href={typeof block.url === 'string' ? block.url : ''}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-4 hover:text-accent-light transition-colors"
        >
          {block.children ? renderChildren(block.children) : block.text || ''}
        </a>
      );
    }

    default: {
      return (
        <div key={key} className="text-neutral-400">
          {block.children ? renderChildren(block.children) : block.text || ''}
        </div>
      );
    }
  }
}

interface StrapiBlocksProps {
  content: StrapiBlock[];
  className?: string;
}

export function StrapiBlocks({ content, className }: StrapiBlocksProps) {
  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-6 ${className ?? ''}`}>
      {content.map((block, idx) => renderBlock(block, `block-${idx}`))}
    </div>
  );
}
