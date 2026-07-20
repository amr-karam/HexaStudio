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
  it('renders the welcome message', async () => {
    render(<HomeScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText(/HEXA Studio/)).toBeTruthy();
    });
  });

  it('renders active projects card', async () => {
    render(<HomeScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText('Active Projects')).toBeTruthy();
    });
  });
});
