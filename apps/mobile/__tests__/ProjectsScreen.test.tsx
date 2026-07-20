import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ProjectsScreen from '../src/app/(tabs)/projects/index';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { AuthProvider } from '../src/hooks/useAuth';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
);

describe('ProjectsScreen', () => {
  it('prompts to sign in when logged out', async () => {
    render(<ProjectsScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText(/Sign in from the Login tab/)).toBeTruthy();
    });
  });

  it('renders the screen title', async () => {
    render(<ProjectsScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeTruthy();
    });
  });
});
