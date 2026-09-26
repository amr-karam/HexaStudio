import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ProjectMilestonesScreen from '../src/app/(tabs)/projects/[id]';
import { fetchProjectDetail } from '../src/lib/api';
import type { User } from '@hexastudio/types';

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
    user: { id: 'u1', email: 'client@hexastudio.net', username: 'client', role: 'user' },
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('../src/components/ThemeProvider', () => ({
  __esModule: true,
  useTheme: () => ({
    colors: {
      background: '#050505',
      foreground: '#FFFFFF',
      surface: '#0F0F10',
      muted: '#6A6A6E',
      gold: '#D4AF37',
      goldBright: '#E5C76B',
      goldDeep: '#A8862E',
      accent: '#D4AF37',
      textPrimary: '#FFFFFF',
      border: '#333333',
      statusPaid: '#22C55E',
      statusPending: '#D4AF37',
      statusOverdue: '#EF4444',
    },
    typography: {
      body: { fontSize: 14, fontWeight: '400', letterSpacing: 0, lineHeight: 22 },
      bodyS: { fontSize: 13, fontWeight: '400', letterSpacing: 0, lineHeight: 18 },
      h3: { fontSize: 18, fontWeight: '600', letterSpacing: -0.2, lineHeight: 24 },
      monoLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, lineHeight: 14 },
      monoValue: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, lineHeight: 16 },
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xl2: 24, xl3: 32, xl4: 48, xl5: 64, xl6: 80 },
    radius: { sm: 4, md: 8, lg: 12, xl: 16, xl2: 24, pill: 999 },
  }),
  useColors: () => ({
    background: '#050505',
    foreground: '#FFFFFF',
    surface: '#0F0F10',
    muted: '#6A6A6E',
    gold: '#D4AF37',
    goldBright: '#E5C76B',
    goldDeep: '#A8862E',
    accent: '#D4AF37',
    textPrimary: '#FFFFFF',
    border: '#333333',
    statusPaid: '#22C55E',
    statusPending: '#D4AF37',
    statusOverdue: '#EF4444',
  }),
}));

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

// Auth state is controlled here so the screen's auth guard can be exercised
// deterministically without simulating the session-restore network flow.
const mockAuthState: { user: User | null; isLoading: boolean } = {
  user: { id: 'u1', email: 'client@hexastudio.net', username: 'client', role: 'user' },
  isLoading: false,
};

jest.setTimeout(60000);

describe('ProjectMilestonesScreen', () => {
  beforeEach(() => {
    mockAuthState.user = { id: 'u1', email: 'client@hexastudio.net', username: 'client', role: 'user' };
    mockAuthState.isLoading = false;
    jest.clearAllMocks();
  });

  it('renders milestones from the API', async () => {
    render(<ProjectMilestonesScreen />);
    await waitFor(() => {
      expect(screen.getByText('Concept Design')).toBeTruthy();
      expect(screen.getByText('Final Render')).toBeTruthy();
    });
  });

  it('shows completion state per milestone', async () => {
    render(<ProjectMilestonesScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Completed · 2026-07-01/)).toBeTruthy();
      expect(screen.getByText(/Upcoming · 2026-08-15/)).toBeTruthy();
    });
  });

  it('renders project progress', async () => {
    render(<ProjectMilestonesScreen />);
    await waitFor(() => {
      expect(screen.getByText('50% complete')).toBeTruthy();
    });
  });

  it('does not fetch project data when signed out', async () => {
    const { useAuth } = jest.requireActual('../src/hooks/useAuth');
    useAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<ProjectMilestonesScreen />);
    await waitFor(() => {
      expect(fetchProjectDetail).not.toHaveBeenCalled();
    });
  });
});