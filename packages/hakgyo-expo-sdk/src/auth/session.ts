import { Session } from '../types/auth';
import { AuthStorage } from './storage';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { HakgyoSDKConfig } from '../config';
import { getAuthClient } from './client';

export class SessionManager {
  private storage: AuthStorage;
  private refreshThreshold: number;
  private autoRefresh: boolean;
  private refreshTimer?: ReturnType<typeof setTimeout>;

  constructor(config: HakgyoSDKConfig['auth'] = {}) {
    this.storage = new AuthStorage(config.storagePrefix);
    this.refreshThreshold = config.sessionRefreshThreshold || 5;
    this.autoRefresh = config.autoRefresh !== false;
  }

  async setSession(session: Session): Promise<void> {
    await this.storage.setItem('session', JSON.stringify(session));
    
    if (this.autoRefresh) {
      this.scheduleRefresh(session);
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      // First, try to get session from better-auth client (uses SecureStore)
      const client = getAuthClient();
      const betterAuthSession = await client.getSession();
      
      if (betterAuthSession?.data) {
        const data = betterAuthSession.data as any;
        const session: Session = {
          token: data.token,
          user: data.user,
          expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: data.createdAt || new Date().toISOString(),
        };
        
        // Check if session is expired
        if (this.isExpired(session)) {
          await this.clearSession();
          return null;
        }

        // Check if session needs refresh
        if (this.shouldRefresh(session)) {
          return await this.refreshSession() || session;
        }

        // Cache in our storage for faster access
        await this.setSession(session);
        return session;
      }

      // Fallback to our storage if better-auth doesn't have a session
      const sessionJson = await this.storage.getItem('session');
      if (!sessionJson) return null;

      const session: Session = JSON.parse(sessionJson);
      
      // Check if session is expired
      if (this.isExpired(session)) {
        await this.clearSession();
        return null;
      }

      // Check if session needs refresh
      if (this.shouldRefresh(session)) {
        return await this.refreshSession() || session;
      }

      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    await this.storage.removeItem('session');
    this.clearRefreshTimer();
  }

  async refreshSession(): Promise<Session | null> {
    try {
      const response = await apiClient.get<Session>(API_ENDPOINTS.AUTH.GET_SESSION);
      
      if (response.success && response.data) {
        await this.setSession(response.data);
        return response.data;
      }
      
      // Refresh failed, clear session?
      // If network error, maybe keep old session?
      // For now, follow design doc which clears session on failure
      await this.clearSession();
      return null;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // await this.clearSession(); // Be careful clearing on network error
      return null;
    }
  }

  private isExpired(session: Session): boolean {
    return new Date(session.expiresAt).getTime() < Date.now();
  }

  private shouldRefresh(session: Session): boolean {
    const expiryTime = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const threshold = this.refreshThreshold * 60 * 1000; // Convert to ms
    
    return expiryTime - now < threshold;
  }

  private scheduleRefresh(session: Session): void {
    this.clearRefreshTimer();
    
    const expiryTime = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const threshold = this.refreshThreshold * 60 * 1000;
    const delay = expiryTime - now - threshold;

    if (delay > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshSession();
      }, delay);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }
}

export const sessionManager = new SessionManager();
