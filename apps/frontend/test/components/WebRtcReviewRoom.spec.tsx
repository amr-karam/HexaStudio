import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WebRtcReviewRoom } from '@/features/portal/components/WebRtcReviewRoom';
import { useDesignerStore } from '@/features/scene/store/designer-store';

describe('WebRtcReviewRoom', () => {
  beforeEach(() => {
    useDesignerStore.setState({
      activeLighting: 'daylight',
      activeMaterial: 'obsidian_marble',
    });
  });

  it('renders room header and E2EE active indicator', () => {
    render(<WebRtcReviewRoom />);
    expect(screen.getByText(/Live WebRTC & Spatial 3D Review Room/i)).toBeInTheDocument();
    expect(screen.getByText(/E2EE/i)).toBeInTheDocument();
  });

  it('switches between 3D Stream, Spatial AI, and Remarks tabs', () => {
    render(<WebRtcReviewRoom />);

    // Click Spatial AI tab
    fireEvent.click(screen.getByRole('button', { name: /Spatial AI/i }));
    expect(screen.getByText(/Generative Lighting Synthesis/i)).toBeInTheDocument();
    expect(screen.getByText(/PBR Architectural Materials/i)).toBeInTheDocument();

    // Click Remarks tab
    fireEvent.click(screen.getByRole('button', { name: /Remarks/i }));
    expect(screen.getByPlaceholderText(/Add spatial design review remark/i)).toBeInTheDocument();

    // Click back to 3D Stream tab
    fireEvent.click(screen.getByRole('button', { name: /3D Stream/i }));
    expect(screen.getByText(/Synchronized 3D Viewport Live Stream/i)).toBeInTheDocument();
  });

  it('allows posting a new review remark', () => {
    render(<WebRtcReviewRoom />);
    fireEvent.click(screen.getByRole('button', { name: /Remarks/i }));

    const input = screen.getByPlaceholderText(/Add spatial design review remark/i);
    const postBtn = screen.getByRole('button', { name: /Post/i });

    fireEvent.change(input, { target: { value: 'Increase exterior facade illumination by 15%.' } });
    fireEvent.click(postBtn);

    expect(screen.getByText('Increase exterior facade illumination by 15%.')).toBeInTheDocument();
  });

  it('toggles microphone and camera mute states', () => {
    render(<WebRtcReviewRoom />);
    const micBtn = screen.getByRole('button', { name: /Mute Mic/i });
    fireEvent.click(micBtn);
    expect(screen.getByRole('button', { name: /Unmute Mic/i })).toBeInTheDocument();

    const camBtn = screen.getByRole('button', { name: /Stop Camera/i });
    fireEvent.click(camBtn);
    expect(screen.getByRole('button', { name: /Start Camera/i })).toBeInTheDocument();
  });
});
