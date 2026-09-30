import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ProjectMilestonesScreen from '../src/app/(tabs)/projects/[id]';
import { fetchProjectDetail } from '../src/lib/api';

/**
 * Mutable auth state read by the `useAuth` mock below. Declared with a `mock`
 * prefix so the hoisted `jest.mock` factory may close over it, and mutated per
 * test so no module re-require is needed.
 */
let mockUser: { id: string; email: string; username: string; role: string } | null = null;

jest.mock('../src/lib/api', () => ({
  __esModule: true,
  ...jest.requireActual('../src/lib/api'),
  fetchProjectDetail: jest.fn(() =>
    Promise.resolve({
      id: 1,
      name: 'Test Project',
      type: 'Residential',
      status: 'In Progress',
      progress: 50,
      startDate: '2026-06-01',
      endDate: '2026-09-01',
      team: [],
      milestones: [
        { id: 1, name: 'Concept Design', date: '2026-07-01', completed: true, description: 'Initial 3D concepts' },
        { id: 2, name: 'Final Render', date: '2026-08-15', completed: false, description: '' },
      ],
    }),
  ),
}));

jest.mock('../src/hooks/useAuth', () => ({
  __esModule: true,
  ...jest.requireActual('../src/hooks/useAuth'),
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

/**
 * Theme is taken from the real design tokens rather than a hand-copied subset.
 * A partial copy silently drifts as components start reading new tokens (this
 * mock was missing `glass`), which fails at render time rather than at
 * type-check time.
 */
jest.mock('../src/components/ThemeProvider', () => {
  const { theme } = jest.requireActual('../src/theme/tokens');
  return {
    __esModule: true,
    useTheme: () => theme,
    useColors: () => theme.colors,
  };
});

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

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSegments: () => ['projects', '1'],
  useLocalSearchParams: () => ({ id: '1', name: 'Test Project' }),
  Redirect: () => null,
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
}));

jest.setTimeout(60000);

describe('ProjectMilestonesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to the signed-in client used by the rendering tests.
    mockUser = { id: 'u1', email: 'client@hexastudio.net', username: 'client', role: 'user' };
  });

  it('renders milestones from the API', async () => {
    const { getByText } = await render(<ProjectMilestonesScreen />);
    await waitFor(() => {
      expect(getByText('Concept Design')).toBeTruthy();
      expect(getByText('Final Render')).toBeTruthy();
    });
  });

  it('shows completion state per milestone', async () => {
    const { getByText } = await render(<ProjectMilestonesScreen />);
    await waitFor(() => {
      expect(getByText(/Completed · 2026-07-01/)).toBeTruthy();
      expect(getByText(/Upcoming · 2026-08-15/)).toBeTruthy();
    });
  });

  it('renders project progress', async () => {
    const { getByText } = await render(<ProjectMilestonesScreen />);
    await waitFor(() => {
      expect(getByText('50% complete')).toBeTruthy();
    });
  });

  it('does not fetch project data when signed out', async () => {
    // Flip the mocked auth state; the component reads it at render time.
    mockUser = null;

await render(<ProjectMilestonesScreen />);
    await waitFor(() => {
      expect(fetchProjectDetail).not.toHaveBeenCalled();
    });
  });
});