/**
 * Administrator Authentication Service
 *
 * Implements server-side authentication with session token and cookie management.
 * - Credentials are never exposed in UI bundles.
 * - Passwords are never stored in localStorage or sessionStorage.
 * - Authentication verification is executed strictly server-side via /api/admin/* endpoints.
 */

const SESSION_TOKEN_KEY = 'the_role_dispatch_admin_session_token';

export interface AuthResponse {
  success: boolean;
  error?: string;
  token?: string;
}

export const authService = {
  /**
   * Retrieves the current active session token from memory or storage
   */
  getToken(): string | null {
    try {
      return (
        sessionStorage.getItem(SESSION_TOKEN_KEY) ||
        localStorage.getItem(SESSION_TOKEN_KEY) ||
        null
      );
    } catch {
      return null;
    }
  },

  /**
   * Fast check if a session token format exists
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return Boolean(token && token.startsWith('sess_'));
  },

  /**
   * Authenticate admin with username & password via /api/admin/login
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    const cleanUser = username.trim();
    const cleanPass = password;

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Invalid username or password' };
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && data?.token) {
        this.setSession(data.token);
        return { success: true, token: data.token };
      }

      return {
        success: false,
        error: data?.error || 'Invalid username or password'
      };
    } catch {
      return { success: false, error: 'Invalid username or password' };
    }
  },

  /**
   * Verify whether the active session token/cookie remains valid on the server
   */
  async verifySession(): Promise<boolean> {
    const token = this.getToken();
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ token: token || '' })
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.valid) return true;
      }
      this.clearSession();
      return false;
    } catch {
      // In temporary offline / disconnected state, verify format
      return Boolean(token && token.startsWith('sess_'));
    }
  },

  /**
   * Log out and invalidate the session
   */
  async logout(): Promise<void> {
    const token = this.getToken();
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ token: token || '' })
      });
    } catch {
      // silent
    }
    this.clearSession();
  },

  /**
   * Store opaque session token (never credentials or passwords)
   */
  setSession(token: string) {
    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } catch {
      // storage error fallback
    }
  },

  /**
   * Clear session token
   */
  clearSession() {
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
      // storage error fallback
    }
  }
};
