import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, syncGoogleUser } = useAuth();
  const { addToast } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Exchanging Google credentials...');
  const [showBypass, setShowBypass] = useState(false);
  const hasNavigatedRef = useRef(false);
  const isSyncingRef = useRef(false);

  // 1. Fast-path: if user is already authenticated in context, go directly to dashboard
  useEffect(() => {
    if (isAuthenticated && user && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    let isSubscribed = true;

    // Show manual continue button if authentication takes more than 5 seconds
    const bypassTimer = setTimeout(() => {
      if (isSubscribed && !hasNavigatedRef.current) {
        setShowBypass(true);
      }
    }, 5000);

    const processSession = async (session: any) => {
      if (isSyncingRef.current || hasNavigatedRef.current) return;
      isSyncingRef.current = true;

      setStatusMessage('Synchronizing adventurer profile with LIFE RPG database...');
      try {
        const res = await authService.syncSupabaseSession(session);

        if (res.success && res.data) {
          if (!hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            syncGoogleUser(res.data.user, res.data.token);
            addToast({
              type: 'success',
              title: 'Google Sign-In Synchronized',
              message: `Welcome, Adventurer ${res.data.user.fullName || 'Adventurer'}!`,
            });
            navigate('/dashboard', { replace: true });
          }
        } else {
          setError(res.error?.message || 'Failed to authenticate Google account with LIFE RPG.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Server communication failed';
        setError(msg);
      }
    };

    const handleOAuthCallback = async () => {
      try {
        // 1. Check URL parameters for OAuth errors or user cancellation
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);

        const errorParam = searchParams.get('error') || hashParams.get('error');
        const errorDesc =
          searchParams.get('error_description') || hashParams.get('error_description');

        if (errorParam) {
          const isUserCancel =
            errorParam === 'access_denied' ||
            errorDesc?.toLowerCase().includes('denied') ||
            errorDesc?.toLowerCase().includes('cancelled') ||
            errorDesc?.toLowerCase().includes('canceled');

          if (isUserCancel) {
            setIsCancelled(true);
            setError('Google Sign-In was cancelled. You can sign in anytime or register with your email.');
          } else {
            setError(errorDesc || errorParam || 'Google authentication could not be completed.');
          }
          return;
        }

        // 2. Handle PKCE code exchange if 'code' parameter is present in URL
        const code = searchParams.get('code');
        if (code) {
          setStatusMessage('Exchanging security authorization code...');
          try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeError && data?.session) {
              await processSession(data.session);
              return;
            }
          } catch (err) {
            console.warn('PKCE exchange attempt:', err);
          }
        }

        // 3. Check for existing active session (implicit flow or already exchanged)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          if (isSubscribed) setError(sessionError.message);
          return;
        }

        if (session) {
          await processSession(session);
          return;
        }

        // 4. Listen for auth change (e.g. hash token parsing completed asynchronously)
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (newSession && !hasNavigatedRef.current) {
              authListener.subscription.unsubscribe();
              await processSession(newSession);
            }
          }
        );

        // 5. Safety timeout if no token was captured
        const timer = setTimeout(() => {
          if (isSubscribed && !hasNavigatedRef.current && !isSyncingRef.current) {
            setError((prev) => prev || 'Authentication session timed out. Please try signing in again.');
          }
        }, 10000);

        return () => {
          clearTimeout(timer);
          clearTimeout(bypassTimer);
          authListener.subscription.unsubscribe();
        };
      } catch (err: unknown) {
        if (isSubscribed) {
          const msg = err instanceof Error ? err.message : 'Unexpected OAuth redirect error';
          setError(msg);
        }
      }
    };

    handleOAuthCallback();

    return () => {
      isSubscribed = false;
      clearTimeout(bypassTimer);
    };
  }, [navigate, syncGoogleUser, addToast]);

  const handleManualContinue = () => {
    hasNavigatedRef.current = true;
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col items-center justify-center p-6 antialiased">
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/40 shadow-2xl flex flex-col items-center text-center">
        {error ? (
          <>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                isCancelled ? 'bg-amber-500/10 text-amber-500' : 'bg-error/10 text-error'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">
                {isCancelled ? 'info' : 'error'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">
              {isCancelled ? 'Sign-In Cancelled' : 'Authentication Error'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-2 mb-6 max-w-xs leading-relaxed">{error}</p>
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs shadow-sm transition-all"
              >
                Return to Sign In
              </button>
              {isCancelled && (
                <button
                  onClick={() => navigate('/register', { replace: true })}
                  className="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs transition-all border border-outline-variant/40"
                >
                  Create New Account
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="relative w-16 h-16 flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-primary-container/20 border-t-primary animate-spin" />
              <span className="material-symbols-outlined text-primary text-[28px]">shield_person</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface tracking-tight">Authenticating Adventurer</h2>
            <p className="text-xs text-on-surface-variant mt-2 mb-4 max-w-xs">{statusMessage}</p>
            <div className="flex items-center gap-2 text-[11px] text-outline mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse" />
              <span>Verifying OAuth 2.0 Security Token</span>
            </div>

            {showBypass && (
              <div className="mt-2 w-full flex flex-col items-center gap-2 animate-fade-in">
                <button
                  type="button"
                  onClick={handleManualContinue}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Dashboard</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <span className="text-[11px] text-on-surface-variant">Profile synchronization in progress</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
