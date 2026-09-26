import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import HomeScreen from '../src/app/(tabs)/index';

jest.mock('../src/hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => ({
    user: null,
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
      textPrimary: '#FFFFFF',
      textSecondary: '#A0A0A0',
      border: '#333333',
    },
    typography: {
      display: { fontSize: 36, fontWeight: '300', letterSpacing: -0.5, lineHeight: 42 },
      h2: { fontSize: 24, fontWeight: '400', letterSpacing: -0.3, lineHeight: 30 },
      body: { fontSize: 14, fontWeight: '400', letterSpacing: 0, lineHeight: 22 },
      bodyS: { fontSize: 13, fontWeight: '400', letterSpacing: 0, lineHeight: 18 },
      monoLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, lineHeight: 14 },
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xl2: 24, xl3: 32, xl4: 48, xl5: 64, xl6: 80 },
  }),
  useColors: () => ({
    background: '#050505',
    foreground: '#FFFFFF',
    surface: '#0F0F10',
    muted: '#6A6A6E',
    gold: '#D4AF37',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#333333',
  }),
}));

jest.mock('../src/lib/api', () => ({
  __esModule: true,
  ...jest.requireActual('../src/lib/api'),
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

jest.mock('../src/lib/haptics', () => ({
  __esModule: true,
  hapticLight: jest.fn(),
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

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prompts to sign in when logged out', async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Sign in to view your dashboard/)).toBeTruthy();
    });
  });

  it('shows dashboard when authenticated', async () => {
    jest.doMock('../src/hooks/useAuth', () => ({
      __esModule: true,
      useAuth: () => ({
        user: { id: 'u1', email: 'test@example.com', username: 'test', role: 'user' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      }),
    }));

    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome/)).toBeTruthy();
    });
  });
});