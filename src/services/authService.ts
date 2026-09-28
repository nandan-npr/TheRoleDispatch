/**
 * Administrator Authentication Service
 *
 * Communicates strictly with serverless API endpoints:
 * - /api/admin/login
 * - /api/admin/verify
 * - /api/admin/logout
 *
 * Relies on secure HttpOnly session cookies.
 * No credentials, passwords, or tokens are stored in client storage.
 */

export interface AuthResponse {
  success: boolean;
  error?: string;
}

const TOKEN_KEY = 'the_role_dispatch_admin_token';

export const authService = {
  /**
   * Retrieve current in-session token for cross-origin iframe requests
   */
  getAuthToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Verify session with the server using cookie or Bearer token fallback.
   */
  async verifySession(): Promise<boolean> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers,
        credentials: 'include' // Transmits HttpOnly admin_session cookie
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        return Boolean(data && data.valid === true);
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Authenticate admin via /api/admin/login
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
        credentials: 'include', // Receives HttpOnly admin_session cookie
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        if (data.token) {
          try {
            sessionStorage.setItem(TOKEN_KEY, data.token);
          } catch {
            // fallback
          }
        }
        return { success: true };
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
   * Log out via /api/admin/logout to clear the HttpOnly cookie and token
   */
  async logout(): Promise<void> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/admin/logout', {
        method: 'POST',
        headers,
        credentials: 'include'
      });
    } catch {
      // silent
    } finally {
      try {
        sessionStorage.removeItem(TOKEN_KEY);
      } catch {
        // silent
      }
    }
  }
};
