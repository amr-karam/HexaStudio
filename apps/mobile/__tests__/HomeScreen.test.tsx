import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../src/app/(tabs)/index';

/**
 * Mutable auth state read by the `useAuth` mock below. Declared with a `mock`
 * prefix so the hoisted `jest.mock` factory may close over it, and mutated per
 * test so no module re-require is needed.
 */
let mockUser: { id: string; email: string; username: string; role: string } | null = null;

// Mock useAuth - resolves the current user from the mutable `mockUser` above.
jest.mock('../src/hooks/useAuth', () => ({
  __esModule: true,
  useAuth: jest.fn(() => ({
    user: mockUser,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

/**
 * Theme is taken from the real design tokens rather than a hand-copied subset.
 * A partial copy silently drifts as components start reading new tokens (this
 * mock was missing `glass` and `radius`), which fails at render time rather
 * than at type-check time.
 */
jest.mock('../src/components/ThemeProvider', () => {
  const { theme } = jest.requireActual('../src/theme/tokens');
  return {
    __esModule: true,
    useTheme: () => theme,
    useColors: () => theme.colors,
  };
});

// Mock API
jest.mock('../src/lib/api', () => ({
  __esModule: true,
  fetchPortalDashboard: jest.fn(() => Promise.resolve({
    project: { title: 'Test Project', category: 'Residential', status: 'In Progress' },
    timeline: [
      { phase: 'Concept Design', status: 'completed', description: 'Initial 3D concepts', date: '2026-07-01' },
      { phase: 'Final Render', status: 'upcoming', description: '', date: '2026-08-15' },
    ],
    invoices: [
      { id: '1', amount: 5000, date: '2026-08-01', status: 'paid' },
      { id: '2', amount: 3000, date: '2026-08-15', status: 'pending' },
    ],
    lead: { name: 'John Doe', role: 'Architect', email: 'john@example.com', avatar: '' },
  })),
}));

// Mock haptics
jest.mock('../src/lib/haptics', () => ({
  __esModule: true,
  hapticLight: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const ReanimatedMock = jest.requireActual('react-native-reanimated/mock');

  const AnimatedView = React.forwardRef((props: unknown, ref: unknown) => {
    return React.createElement(View, { ...(props as Record<string, unknown>), ref });
  });

  return {
    ...ReanimatedMock,
    default: {
      ...ReanimatedMock.default,
      View: AnimatedView,
      createAnimatedComponent: (Component: unknown) => {
        return React.forwardRef((props: unknown, ref: unknown) => {
          const Comp = Component as React.ComponentType<Record<string, unknown>>;
          return React.createElement(Comp, { ...(props as Record<string, unknown>), ref });
        });
      },
    },
  };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSegments: () => [''],
  useLocalSearchParams: () => ({ id: '1', name: 'Test Project' }),
  Redirect: () => null,
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
  });

  it('prompts to sign in when logged out', async () => {
    const { getByText } = await render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText(/Sign in to view your dashboard/)).toBeTruthy();
    });
  });

  it('shows dashboard when authenticated', async () => {
    // Flip the mocked auth state; the component reads it at render time.
    mockUser = { id: 'u1', email: 'test@example.com', username: 'test', role: 'user' };

    const { getByText } = await render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText(/Welcome/)).toBeTruthy();
    });
  });
});