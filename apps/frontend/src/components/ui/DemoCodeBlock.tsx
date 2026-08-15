import React from 'react';
import { StrapiBlocks } from './StrapiBlocks';

// Demo content for testing large code blocks
const demoCodeBlock = {
  type: 'code',
  children: [
    {
      type: 'text',
      text: `// Large code block demo (simulated 5MB+ file)
      // This simulates a large file with repeated content for testing.
      
      // Simulate 5000 lines of code (for testing purposes)
      ${Array.from({ length: 5000 }).map((_, i) => `
      // Line ${i + 1}: This is a simulated line of code for performance testing.`).join('')}
      
      // Example of a function
      function exampleFunction() {
        return 'Hello, World!';
      }
      
      // Example of a class
      class ExampleClass {
        constructor() {
          this.value = 'Test';
        }
      }
      `,
    },
  ],
  language: 'typescript',
};

export default function DemoCodeBlock() {
  return (
    <div className="artisan-glass p-6 md:p-10 rounded-2xl border border-border/30 shadow-2xl">
      <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent block mb-2">
        Diagnostic & Benchmarking
      </span>
      <h1 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-6">
        Large Code Block <span className="italic text-accent">Virtualization</span>
      </h1>
      <StrapiBlocks content={[demoCodeBlock]} />
    </div>
  );
}