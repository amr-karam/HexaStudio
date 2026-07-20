import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import HomeScreen from '../src/app/(tabs)/index';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { AuthProvider } from '../src/hooks/useAuth';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
);

describe('HomeScreen', () => {
  it('renders the welcome heading and subtitle', async () => {
    render(<HomeScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText(/HEXA Studio/)).toBeTruthy();
    });
  });

  it('prompts to sign in when logged out', async () => {
    render(<HomeScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText(/Sign in to view your project dashboard/)).toBeTruthy();
    });
  });
});
