import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

function Harness({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref} data-testid="trap">
      <button>first</button>
      <button>middle</button>
      <button>last</button>
      <button data-testid="outside">outside</button>
    </div>
  );
}

// Note: focus trap listens on document, so we need container + focus setup
describe('useFocusTrap', () => {
  it('cycles Tab from last to first', () => {
    const { getByText } = render(<Harness active />);
    const first = getByText('first') as HTMLButtonElement;
    const last = getByText('last') as HTMLButtonElement;

    last.focus();
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    // trap prevents default and moves to first
    expect(document.activeElement).toBe(first);
  });

  it('cycles Shift+Tab from first to last', () => {
    const { getByText } = render(<Harness active />);
    const first = getByText('first') as HTMLButtonElement;
    const last = getByText('last') as HTMLButtonElement;

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('does nothing when inactive', () => {
    const { getByText } = render(<Harness active={false} />);
    const last = getByText('last') as HTMLButtonElement;
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(last); // no trap
  });

  it('ignores non-Tab keys', () => {
    const { getByText } = render(<Harness active />);
    const last = getByText('last') as HTMLButtonElement;
    last.focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(last);
  });
});
