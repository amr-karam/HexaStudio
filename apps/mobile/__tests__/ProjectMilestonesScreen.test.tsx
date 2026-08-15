import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ProjectMilestonesScreen from '../src/app/(tabs)/projects/[id]';
import { ThemeProvider } from '../src/components/ThemeProvider';

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

jest.setTimeout(60000);

describe('ProjectMilestonesScreen', () => {
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
});
