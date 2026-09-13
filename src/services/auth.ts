import { api } from './api';
import { ApiResponse, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export interface LoginPayload {
  email: string;
  password?: string;
  fullName?: string;
  phone?: string;
}

export interface AuthResult {
  user: UserProfile;
  token: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResult>> {
    const res = await api.post<AuthResult>('/auth/login', payload);
    if (res.success && res.data?.token) {
      api.setToken(res.data.token);
    }
    return res;
  },

  async register(payload: LoginPayload): Promise<ApiResponse<AuthResult>> {
    const res = await api.post<AuthResult>('/auth/register', payload);
    if (res.success && res.data?.token) {
      api.setToken(res.data.token);
    }
    return res;
  },

  async loginWithGoogle(): Promise<ApiResponse<AuthResult>> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        data: null as unknown as AuthResult,
        error: {
          code: 'SUPABASE_NOT_CONFIGURED',
          message: 'Supabase Google Auth is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your frontend .env file.'
        }
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (error) {
        return {
          success: false,
          data: null as unknown as AuthResult,
          error: { code: 'OAUTH_ERROR', message: error.message }
        };
      }

      return {
        success: true,
        data: null as unknown as AuthResult
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication could not be started.';
      return {
        success: false,
        data: null as unknown as AuthResult,
        error: { code: 'OAUTH_FAILED', message: msg }
      };
    }
  },

  async syncSupabaseSession(session: any): Promise<ApiResponse<AuthResult>> {
    if (!session?.user?.email) {
      return {
        success: false,
        data: null as unknown as AuthResult,
        error: { code: 'NO_SESSION', message: 'No valid user credentials found in Google OAuth session.' }
      };
    }

    const payload = {
      email: session.user.email,
      fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Google Adventurer',
      googleId: session.user.id,
      avatar: session.user.user_metadata?.avatar_url
    };

    const res = await api.post<AuthResult>('/auth/google', payload);
    if (res.success && res.data?.token) {
      api.setToken(res.data.token);
    }
    return res;
  },

  async logout(): Promise<ApiResponse<null>> {
    try {
      await api.post<null>('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      api.setToken(null);
    }
    return { success: true, data: null };
  },

  async getMe(): Promise<ApiResponse<UserProfile>> {
    return api.get<UserProfile>('/auth/me');
  },
};
