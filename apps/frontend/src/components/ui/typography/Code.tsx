'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Code Component Types                                                 */
/* -------------------------------------------------------------------------- */

export type CodeMode = 'inline' | 'block';
export type CodeLanguage =
  | 'tsx' | 'ts' | 'jsx' | 'js' | 'css' | 'json' | 'html' | 'md' | 'bash' | 'yaml' | 'graphql' | string;

type CodeOwnProps = {
  mode?: CodeMode;
  language?: CodeLanguage;
  copyable?: boolean;
  showLineNumbers?: boolean;
  as?: React.ElementType;
};

type CodeProps = CodeOwnProps & React.HTMLAttributes<HTMLDivElement>;

/* -------------------------------------------------------------------------- */
/*  Code Component                                                     */
/* -------------------------------------------------------------------------- */

const Code = React.forwardRef<HTMLDivElement, CodeProps>(
  (
    { mode = 'inline', language, copyable: _copyable, showLineNumbers: _showLineNumbers, className, children, ...rest },
    ref,
  ) => {
    const Component = rest.as ?? (mode === 'block' ? 'pre' : 'code');
    delete (rest as Record<string, unknown>).as;
    const restWithoutAs = rest;

    const classNames = mode === 'block'
      ? cn('code-block', 'font-mono', className)
      : cn('code-inline', className);

    return React.createElement(
      Component,
      { ref, className: classNames, 'data-language': language, ...restWithoutAs },
      children,
    );
  },
);

Code.displayName = 'Code';

/* -------------------------------------------------------------------------- */
/*  BlockCode — Convenience wrapper for full code blocks               */
/* -------------------------------------------------------------------------- */

type BlockCodeProps = CodeOwnProps & React.HTMLAttributes<HTMLDivElement>;

export type { BlockCodeProps };

const BlockCode = React.forwardRef<HTMLDivElement, BlockCodeProps>(
  (
    { title, language, copyable = true, className, children, ...props },
    ref,
  ) => {
    const classNames = cn('code-block-wrapper', className);

    return (
      <figure ref={ref} className={classNames} {...props}>
        {title && (
          <figcaption className="text-hex-xs text-hex-muted font-mono mb-2 uppercase tracking-[0.2em]">
            {title}
          </figcaption>
        )}
        <Code mode="block" language={language} copyable={copyable}>
          {children}
        </Code>
      </figure>
    );
  },
);

BlockCode.displayName = 'BlockCode';

export { Code, BlockCode };