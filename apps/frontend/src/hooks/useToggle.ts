'use client';

import { useCallback, useState } from 'react';

/**
 * Boolean toggle with stable callbacks.
 * Replaces `const [open, setOpen] = useState(false)` + inline `setOpen(v=>!v)` noise.
 *
 * @param initialValue - starting boolean (default false)
 * @returns [value, toggle, setTrue, setFalse, setValue]
 *
 * @example
 * const [isOpen, toggle, open, close] = useToggle(false);
 * // isOpen:boolean, toggle():void, open():void, close():void, setValue(boolean)
 */
export function useToggle(
  initialValue = false,
): [boolean, () => void, () => void, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse, setValue];
}
