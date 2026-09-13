import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { authService, LoginPayload } from '../services/auth';
import { profileService } from '../services/profile';
import { api } from '../services/api';
import { supabase } from '../services/supabase';

interface AuthResponseResult {
  success: boolean;
  error?: {
    code?: string;
    message: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponseResult>;
  register: (payload: LoginPayload) => Promise<AuthResponseResult>;
  loginWithGoogle: () => Promise<AuthResponseResult>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  refreshSession: () => Promise<void>;
  syncGoogleUser: (user: UserProfile, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on application mount
  const restoreSession = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        // Invalid or expired token
        api.setToken(null);
        setUser(null);
      }
    } catch {
      api.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();

    // Global Supabase auth state listener for SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, INITIAL_SESSION
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // On the callback route, let AuthCallbackPage handle the dedicated UI feedback, session sync, and redirect
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')) {
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        // Prevent redundant synchronization if already active with matching user
        const currentToken = api.getToken();
        if (currentToken && user?.email === session.user.email) {
          return;
        }

        try {
          const res = await authService.syncSupabaseSession(session);
          if (res.success && res.data) {
            api.setToken(res.data.token);
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Error synchronizing Supabase SIGNED_IN session:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        api.setToken(null);
        setUser(null);
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user && !api.getToken()) {
          try {
            const res = await authService.syncSupabaseSession(session);
            if (res.success && res.data) {
              api.setToken(res.data.token);
              setUser(res.data.user);
            }
          } catch (err) {
            console.error('Error syncing INITIAL_SESSION:', err);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [restoreSession, user?.email]);

  const login = async (payload: LoginPayload): Promise<AuthResponseResult> => {
    setIsLoading(true);
    try {
      const res = await authService.login(payload);
      if (res.success && res.data) {
        setUser(res.data.user);
        return { success: true };
      }
      return {
        success: false,
        error: res.error || { message: 'Invalid email or password' },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return {
        success: false,
        error: { message: msg },
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: LoginPayload): Promise<AuthResponseResult> => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      if (res.success && res.data) {
        setUser(res.data.user);
        return { success: true };
      }
      return {
        success: false,
        error: res.error || { message: 'Could not create account' },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return {
        success: false,
        error: { message: msg },
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<AuthResponseResult> => {
    try {
      const res = await authService.loginWithGoogle();
      if (res.success) {
        // OAuth redirect initiated by browser client
        return { success: true };
      }
      return {
        success: false,
        error: res.error || { message: 'Google authentication failed to start.' },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google OAuth error';
      return {
        success: false,
        error: { message: msg },
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // safe fallback
    } finally {
      api.setToken(null);
      setUser(null);
      // Purge all user cached keys
      try {
        localStorage.removeItem('life_rpg_user');
        localStorage.removeItem('life_rpg_character');
        localStorage.removeItem('life_rpg_quests');
        localStorage.removeItem('life_rpg_rewards');
        localStorage.removeItem('life_rpg_token');
      } catch {
        // ignore
      }
    }
  };

  const updateUser = async (updates: Partial<UserProfile>): Promise<boolean> => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    try {
      const res = await profileService.updateProfile(updates);
      if (res.success && res.data) {
        setUser(res.data);
        return true;
      }
    } catch {
      // rollback or ignore
    }
    return false;
  };

  const completeOnboarding = async () => {
    setUser((prev) => (prev ? { ...prev, onboardingCompleted: true } : null));
    try {
      await profileService.updateProfile({ onboardingCompleted: true });
    } catch {
      // ignore
    }
  };

  const refreshSession = async () => {
    await restoreSession();
  };

  const syncGoogleUser = useCallback((googleUser: UserProfile, token: string) => {
    api.setToken(token);
    setUser(googleUser);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
        completeOnboarding,
        refreshSession,
        syncGoogleUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
