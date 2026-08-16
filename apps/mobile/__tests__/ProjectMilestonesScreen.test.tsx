import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ProjectMilestonesScreen from '../src/app/(tabs)/projects/[id]';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { fetchProjectDetail } from '../src/lib/api';
import type { User } from '@hexastudio/types';

jest.mock('../src/lib/api', () => ({
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

// Auth state is controlled here so the screen's auth guard can be exercised
// deterministically without simulating the session-restore network flow.
const mockAuthState: { user: User | null; isLoading: boolean } = {
  user: { id: 'u1', email: 'client@hexastudio.net', username: 'client', role: 'user' },
  isLoading: false,
};

jest.mock('../src/hooks/useAuth', () => ({
  __esModule: true,
  ...jest.requireActual('../src/hooks/useAuth'),
  useAuth: () => ({
    ...mockAuthState,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.setTimeout(60000);

describe('ProjectMilestonesScreen', () => {
  beforeEach(() => {
    mockAuthState.user = { id: 'u1', email: 'client@hexastudio.net', username: 'client', role: 'user' };
    mockAuthState.isLoading = false;
    jest.clearAllMocks();
  });

  it('renders milestones from the API', async () => {
    render(<ProjectMilestonesScreen />, { wrapper: ThemeProvider });
    await waitFor(() => {
      expect(screen.getByText('Concept Design')).toBeTruthy();
      expect(screen.getByText('Final Render')).toBeTruthy();
    });
  });

  it('shows completion state per milestone', async () => {
    render(<ProjectMilestonesScreen />, { wrapper: ThemeProvider });
    await waitFor(() => {
      expect(screen.getByText(/Completed · 2026-07-01/)).toBeTruthy();
      expect(screen.getByText(/Upcoming · 2026-08-15/)).toBeTruthy();
    });
  });

  it('renders project progress', async () => {
    render(<ProjectMilestonesScreen />, { wrapper: ThemeProvider });
    await waitFor(() => {
      expect(screen.getByText('50% complete')).toBeTruthy();
    });
  });

  it('does not fetch project data when signed out', async () => {
    mockAuthState.user = null;
    render(<ProjectMilestonesScreen />, { wrapper: ThemeProvider });
    await waitFor(() => {
      expect(fetchProjectDetail).not.toHaveBeenCalled();
    });
  });
});