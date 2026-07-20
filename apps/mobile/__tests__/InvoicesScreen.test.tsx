import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import InvoicesScreen from '../src/app/(tabs)/invoices/index';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { AuthProvider } from '../src/hooks/useAuth';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
);

describe('InvoicesScreen', () => {
  it('prompts to sign in when logged out', async () => {
    render(<InvoicesScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText(/Sign in from the Profile tab/)).toBeTruthy();
    });
  });

  it('renders the screen title', async () => {
    render(<InvoicesScreen />, { wrapper: AllProviders });
    await waitFor(() => {
      expect(screen.getByText('Invoices')).toBeTruthy();
    });
  });
});
