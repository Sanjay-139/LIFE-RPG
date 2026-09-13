import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GoogleButton } from '../components/common/GoogleButton';

export const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Authentication keys do not match.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      email,
      password,
      fullName: fullName.trim() || 'New Adventurer',
    });
    setIsLoading(false);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Dossier Initialized',
        message: 'Welcome to LIFE RPG! Initiating Adventurer Onboarding protocol.',
      });
      navigate('/onboarding');
    } else {
      const msg = result.error?.message || 'Could not create account.';
      if (msg.toLowerCase().includes('already exists') || result.error?.code === 'EMAIL_EXISTS') {
        setErrorMessage('An account with this email address already exists. Please log in.');
      } else {
        setErrorMessage(msg);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();

    if (!result.success) {
      setIsGoogleLoading(false);
      setErrorMessage(result.error?.message || 'Could not authenticate with Google.');
    }
    // If result.success is true, leave isGoogleLoading = true ("Redirecting to Google...")
    // as the browser completes the OAuth redirect.
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/40 p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">shield</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">
              Create Adventurer Dossier
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Begin your LIFE RPG progression journey with a Level 0 baseline.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              className="p-3.5 rounded-xl bg-error-container/30 border border-error/40 flex items-start gap-3 text-on-surface text-xs animate-fade-in"
              role="alert"
            >
              <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">
                error
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-error">Registration Notice</span>
                <p className="text-on-surface-variant mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Google Sign-in */}
          <GoogleButton
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
            text="Continue with Google"
          />

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow h-px bg-surface-container-high" />
            <span className="shrink mx-4 text-xs font-bold uppercase tracking-wider text-outline">
              Or register with email
            </span>
            <div className="flex-grow h-px bg-surface-container-high" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface">Character / Full Name</label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Arion Vance"
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arion@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface">Authentication Key (Password)</label>
              <div className="relative flex items-center">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-outline hover:text-on-surface focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface">Confirm Key</label>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:bg-primary transition-all shadow-md shadow-primary-container/20 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Enrolling Adventurer...</span>
                </>
              ) : (
                <>
                  <span>CREATE ACCOUNT & INITIALIZE</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-surface-container-high text-center text-xs text-on-surface-variant">
            <span>Already have an active dossier? </span>
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
