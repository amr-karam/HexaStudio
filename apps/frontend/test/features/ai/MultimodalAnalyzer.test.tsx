import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MultimodalAnalyzer } from '@/features/ai';

describe('MultimodalAnalyzer', () => {
  it('renders the studio header and mode selection tabs', () => {
    render(<MultimodalAnalyzer />);

    expect(screen.getByText(/AI Multimodal Studio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^architecture$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3D QA/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^material$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^bim$/i })).toBeInTheDocument();
  });

  it('renders the file dropzone when no image is selected', () => {
    render(<MultimodalAnalyzer />);

    expect(screen.getByText(/Drop architectural render or floorplan/i)).toBeInTheDocument();
  });
});
