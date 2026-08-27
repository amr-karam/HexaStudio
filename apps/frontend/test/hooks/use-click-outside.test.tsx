import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

function Harness({ onOutside, enabled = true }: { onOutside: () => void; enabled?: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useClickOutside([panelRef, triggerRef], onOutside, { enabled, event: 'mousedown', delay: 0 });
  return (
    <>
      <button ref={triggerRef}>trigger</button>
      <div ref={panelRef}>panel</div>
      <div data-testid="outside">outside</div>
    </>
  );
}

describe('useClickOutside', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls handler on outside mousedown', async () => {
    const spy = vi.fn();
    render(<Harness onOutside={spy} />);
    act(() => vi.runAllTimers()); // let listener attach
    fireEvent.mouseDown(document.querySelector('[data-testid="outside"]')!);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not call handler on inside click (panel)', () => {
    const spy = vi.fn();
    const { getByText } = render(<Harness onOutside={spy} />);
    act(() => vi.runAllTimers());
    fireEvent.mouseDown(getByText('panel'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not call handler on trigger click', () => {
    const spy = vi.fn();
    const { getByText } = render(<Harness onOutside={spy} />);
    act(() => vi.runAllTimers());
    fireEvent.mouseDown(getByText('trigger'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('disabled does not attach', () => {
    const spy = vi.fn();
    render(<Harness onOutside={spy} enabled={false} />);
    act(() => vi.runAllTimers());
    fireEvent.mouseDown(document.querySelector('[data-testid="outside"]')!);
    expect(spy).not.toHaveBeenCalled();
  });

  it('uses latest handler ref', () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    const { rerender } = render(<Harness onOutside={spy1} />);
    act(() => vi.runAllTimers());
    rerender(<Harness onOutside={spy2} />);
    act(() => vi.runAllTimers());
    fireEvent.mouseDown(document.querySelector('[data-testid="outside"]')!);
    expect(spy2).toHaveBeenCalledTimes(1);
    expect(spy1).not.toHaveBeenCalled();
  });
});
