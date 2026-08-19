declare module '@testing-library/react-native' {
  import { ReactElement } from 'react';

  export function render(
    ui: ReactElement,
    options?: Record<string, unknown>
  ): {
    unmount: () => void;
    getByText: (text: string | RegExp) => unknown;
    getByTestId: (testID: string) => unknown;
    queryByText: (text: string | RegExp) => unknown;
    queryByTestId: (testID: string) => unknown;
    findAllByText: (text: string | RegExp) => Promise<unknown[]>;
  };

  export const screen: {
    getByText: (text: string | RegExp) => unknown;
    getByTestId: (testID: string) => unknown;
    queryByText: (text: string | RegExp) => unknown;
    queryByTestId: (testID: string) => unknown;
  };

  export function waitFor(
    callback: () => void | Promise<void>,
    options?: Record<string, unknown>
  ): Promise<void>;

  export function renderHook<T>(
    hook: () => T,
    options?: Record<string, unknown>
  ): {
    result: { current: T };
    unmount: () => void;
    waitFor: (callback: (result: { current: T }) => void | Promise<void>, options?: Record<string, unknown>) => Promise<void>;
  };

  export function act(
    callback: () => void | Promise<void>
  ): Promise<void>;
}
