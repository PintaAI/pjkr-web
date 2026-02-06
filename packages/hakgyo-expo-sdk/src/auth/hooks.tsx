import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, SignInResponse, SignUpResponse, SignOutResponse } from '../types/auth';
import { sessionManager } from './session';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } from './client';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<SignInResponse>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<SignUpResponse>;
  signInWithGoogle: (idToken: string) => Promise<SignInResponse>;
  signOut: () => Promise<SignOutResponse>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session on mount
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const currentSession = await sessionManager.getSession();
      setSession(currentSession);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignInWithEmail(email: string, password: string) {
    const result = await signInWithEmail(email, password);
    if (result.success && result.session) {
      await sessionManager.setSession(result.session);
      setSession(result.session);
    }
    return result;
  }

  async function handleSignUpWithEmail(email: string, password: string, name: string) {
    const result = await signUpWithEmail(email, password, name);
    if (result.success && result.session) {
      await sessionManager.setSession(result.session);
      setSession(result.session);
    }
    return result;
  }

  async function handleSignInWithGoogle(idToken: string) {
    const result = await signInWithGoogle(idToken);
    if (result.success && result.session) {
      await sessionManager.setSession(result.session);
      setSession(result.session);
    }
    return result;
  }

  async function handleSignOut() {
    const result = await signOut();
    if (result.success) {
      await sessionManager.clearSession();
      setSession(null);
    }
    return result;
  }

  async function handleRefreshSession() {
    const refreshedSession = await sessionManager.refreshSession();
    if (refreshedSession) {
      setSession(refreshedSession);
    } else {
      setSession(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        loading,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        refreshSession: handleRefreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useSession() {
  const { session, user, loading } = useAuth();
  return { session, user, loading };
}
