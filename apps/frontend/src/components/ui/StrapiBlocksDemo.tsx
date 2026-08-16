import React from 'react';
import { StrapiBlocks } from './StrapiBlocks';

// Demo content for StrapiBlocks
const demoContent = [
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'This is a demo of the StrapiBlocks component with syntax highlighting.',
      },
    ],
  },
  {
    type: 'code',
    language: 'typescript',
    children: [
      {
        type: 'text',
        text: `// This is a demo of TypeScript code
        function greet(name: string): string {
          return \`Hello, (\${name})!\`;
        }
        `,
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'The code block above should be syntax-highlighted when visible.',
      },
    ],
  },
];

export function StrapiBlocksDemo() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">StrapiBlocks Demo</h1>
      <StrapiBlocks content={demoContent} />
    </div>
  );
}
