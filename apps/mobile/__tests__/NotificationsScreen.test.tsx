import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import NotificationsScreen from '../src/app/(tabs)/notifications/index';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { AuthProvider } from '../src/hooks/useAuth';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
);

describe('NotificationsScreen', () => {
  it('renders the screen title', async () => {
    render(<NotificationsScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeTruthy();
    });
  });

  it('prompts to sign in when logged out', async () => {
    render(<NotificationsScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText('Sign in to manage notifications.')).toBeTruthy();
    });
  });
});
