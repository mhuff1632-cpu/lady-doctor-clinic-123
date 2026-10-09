import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, AdminRole } from '../types/auth';
import { getCurrentAdminSession, signInAdmin, signOutAdmin } from '../lib/supabase/auth';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase/client';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  role: AdminRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const session = await getCurrentAdminSession();
      setUser(session.user);
      setProfile(session.profile);
      setIsDemoMode(session.isDemo);
    } catch (e: any) {
      console.warn('Session refresh failed:', e);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    const client = getSupabaseClient();
    if (isSupabaseConfigured && client) {
      const { data: listener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setProfile(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          refreshSession();
        }
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await signInAdmin(email, pass);
      if (res.success && res.user && res.profile) {
        setUser(res.user);
        setProfile(res.profile);
        setIsDemoMode(Boolean(res.isDemo));
        return { success: true };
      }
      setError(res.error || 'Authentication failed.');
      return { success: false, error: res.error };
    } catch (err: any) {
      const msg = err?.message || 'Login request failed.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await signOutAdmin();
    setUser(null);
    setProfile(null);
    setIsDemoMode(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        isAuthenticated: Boolean(user && profile),
        isLoading,
        isDemoMode,
        error,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
