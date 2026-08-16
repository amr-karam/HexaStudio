import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/features/auth/hooks/useAuth';
import { API_BASE_URL } from '@/config/constants';

/* -------------------------------------------------------------------------- */
/*  Mocks                                                                     */
/* -------------------------------------------------------------------------- */

// Module-level state lives in @/lib/api-client — mock the whole module so
// tokens are deterministic and no real network is hit.
const apiClientMocks = vi.hoisted(() => ({
  setRefreshToken: vi.fn(),
  setAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  onAuthLogout: vi.fn(),
  authFetch: vi.fn(),
}));

vi.mock('@/lib/api-client', () => apiClientMocks);

const fetchMock = vi.fn();

const user = { id: 'u1', email: 'designer@hexastudio.net', username: 'designer', role: 'user' as const };

// Captures the `logout` function for imperative, same-tick concurrent invocations.
let logoutFn: (() => Promise<void>) | undefined;

function TestConsumer() {
  const { user: currentUser, logout } = useAuth();
  logoutFn = logout;
  return (
    <div>
      <span data-testid="auth-user">{currentUser ? currentUser.email : 'anonymous'}</span>
      <button type="button" onClick={() => void logout()}>
        Logout
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe('useAuth logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logoutFn = undefined;
    apiClientMocks.getRefreshToken.mockReturnValue('refresh-token-123');
    apiClientMocks.authFetch.mockResolvedValue(null);
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('clears auth state synchronously and revokes the session with the captured token', async () => {
    apiClientMocks.authFetch.mockResolvedValue({ data: user });
    renderProvider();

    // Wait for the session to be hydrated from /users/me.
    await waitFor(() => expect(screen.getByTestId('auth-user')).toHaveTextContent(user.email));

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    // Local session is cleared immediately — even before the API settles.
    await waitFor(() => expect(screen.getByTestId('auth-user')).toHaveTextContent('anonymous'));
    expect(apiClientMocks.setRefreshToken).toHaveBeenCalledWith(null);
    expect(apiClientMocks.setAccessToken).toHaveBeenCalledWith(null);

    // The token was captured before clearing and sent with the API call.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE_URL}/api/auth/logout`);
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(JSON.parse(String(init.body))).toEqual({ refreshToken: 'refresh-token-123' });
  });

  it('does not double-clear auth state on a single logout', async () => {
    renderProvider();

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    await waitFor(() => expect(screen.getByTestId('auth-user')).toHaveTextContent('anonymous'));

    expect(apiClientMocks.setRefreshToken).toHaveBeenCalledTimes(1);
    expect(apiClientMocks.setRefreshToken).toHaveBeenCalledWith(null);
    expect(apiClientMocks.setAccessToken).toHaveBeenCalledTimes(1);
    expect(apiClientMocks.setAccessToken).toHaveBeenCalledWith(null);
  });

  it('is idempotent — concurrent logout calls fire a single API request', async () => {
    renderProvider();

    // Invoke logout twice inside the same act batch: the second call lands
    // before the first invocation's in-flight guard can reset, so only one
    // API request and one state clear may happen.
    await act(async () => {
      void logoutFn?.();
      void logoutFn?.();
    });

    await waitFor(() => expect(screen.getByTestId('auth-user')).toHaveTextContent('anonymous'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(apiClientMocks.setRefreshToken).toHaveBeenCalledTimes(1);
    expect(apiClientMocks.setAccessToken).toHaveBeenCalledTimes(1);
  });

  it('clears local state even when the API call fails', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    apiClientMocks.authFetch.mockResolvedValue({ data: user });
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('auth-user')).toHaveTextContent(user.email));

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => expect(screen.getByTestId('auth-user')).toHaveTextContent('anonymous'));
    expect(apiClientMocks.setRefreshToken).toHaveBeenCalledWith(null);
    expect(apiClientMocks.setAccessToken).toHaveBeenCalledWith(null);
  });
});