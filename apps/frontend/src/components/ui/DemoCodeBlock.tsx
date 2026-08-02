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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Demo: Large Code Block (Lazy Loading)</h2>
      <StrapiBlocks content={[demoCodeBlock]} />
    </div>
  );
}