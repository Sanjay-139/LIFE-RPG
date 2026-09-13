import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GoogleButton } from '../components/common/GoogleButton';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'NOT_FOUND' | 'INVALID_CREDENTIALS' | 'GENERAL' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorType(null);

    if (!email || !email.includes('@')) {
      setErrorType('GENERAL');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorType('GENERAL');
      setErrorMessage('Please enter your authentication key (password).');
      return;
    }

    setIsLoading(true);
    const result = await login({ email, password });
    setIsLoading(false);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'World Node Synchronized',
        message: 'Welcome back to LIFE RPG!',
      });
      navigate('/dashboard');
    } else {
      const code = result.error?.code;
      const msg = result.error?.message || '';

      if (code === 'USER_NOT_FOUND' || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('could not find')) {
        setErrorType('NOT_FOUND');
        setErrorMessage("We couldn't find an account with that email.");
      } else if (code === 'INVALID_CREDENTIALS' || msg.toLowerCase().includes('invalid')) {
        setErrorType('INVALID_CREDENTIALS');
        setErrorMessage('Email or password is incorrect.');
      } else {
        setErrorType('GENERAL');
        setErrorMessage(msg || 'Authentication failed. Please check your credentials or network.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setErrorType(null);
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();

    if (!result.success) {
      setIsGoogleLoading(false);
      setErrorType('GENERAL');
      setErrorMessage(result.error?.message || 'Could not authenticate with Google.');
    }
    // If result.success is true, leave isGoogleLoading = true ("Redirecting to Google...")
    // as the browser completes the OAuth redirect.
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-12 antialiased">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Card */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/40 p-6 sm:p-10 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center p-2.5 shrink-0 shadow-sm border border-outline-variant/30">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 12L76 22V52C76 68.5 65 81.5 50 86C35 81.5 24 68.5 24 52V22L50 12Z"
                      stroke="#3525cd"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                      fill="#f2f3ff"
                    />
                    <path
                      d="M38 68L32 74C30 76 27 76 25 74L24 73C22 71 22 68 24 66L30 60"
                      stroke="#855300"
                      strokeLinecap="round"
                      strokeWidth="5"
                    />
                    <path d="M37 55L69 23L77 31L45 63" fill="#4f46e5" />
                    <path d="M69 23L79 17L81 27L77 31L69 23Z" fill="#fea619" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-primary font-bold">
                      LIFE RPG • Authentication Portal
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
                      v2.4 System
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-0.5">
                    Resume Your Quest
                  </h1>
                  <p className="text-xs sm:text-sm text-on-surface-variant">
                    Synchronize your real-world tasks, attributes, and daily streaks.
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div
                  className="mb-6 p-4 rounded-xl bg-error-container/30 border border-error/40 flex items-start justify-between gap-3 text-on-surface animate-fade-in"
                  role="alert"
                >
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
                      error
                    </span>
                    <div className="flex flex-col text-xs">
                      <span className="font-bold text-error">
                        {errorType === 'NOT_FOUND'
                          ? 'ACCOUNT NOT FOUND'
                          : errorType === 'INVALID_CREDENTIALS'
                          ? 'INVALID CREDENTIALS'
                          : 'AUTHENTICATION ERROR'}
                      </span>
                      <p className="text-on-surface-variant mt-0.5">{errorMessage}</p>
                    </div>
                  </div>

                  {errorType === 'NOT_FOUND' && (
                    <Link
                      to="/register"
                      className="px-3 py-1 rounded-lg bg-primary-container text-on-primary text-xs font-bold whitespace-nowrap shadow-sm hover:bg-primary transition-colors shrink-0"
                    >
                      Create Account
                    </Link>
                  )}
                </div>
              )}

              {/* Google Sign-In */}
              <div className="mb-6">
                <GoogleButton
                  onClick={handleGoogleLogin}
                  isLoading={isGoogleLoading}
                  text="Continue with Google"
                />
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center mb-6">
                <div className="flex-grow h-px bg-surface-container-high" />
                <span className="shrink mx-4 text-xs font-bold uppercase tracking-wider text-outline">
                  Or enter with email
                </span>
                <div className="flex-grow h-px bg-surface-container-high" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[11px] text-outline font-normal">Registered Dossier</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined text-[20px] text-outline absolute left-3 pointer-events-none">
                      mail
                    </span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adventurer@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Key */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface">Authentication Key (Password)</label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      FORGOT PASSWORD?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined text-[20px] text-outline absolute left-3 pointer-events-none">
                      key
                    </span>
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm font-mono"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:bg-primary transition-all shadow-md shadow-primary-container/20 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Synchronizing Dossier...</span>
                    </>
                  ) : (
                    <>
                      <span>LOGIN & RESUME QUEST</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switch */}
              <div className="mt-8 pt-6 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
                <span>New to LIFE RPG system?</span>
                <Link
                  to="/register"
                  className="text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <span>Initiate New Adventurer Dossier</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Banner / Info Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/40 p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-xs uppercase font-bold text-secondary tracking-wider">
                  Live Game Engine
                </span>
              </div>
              <h3 className="text-xl font-bold text-on-surface tracking-tight">
                Turn Mundane Tasks into Compounding Legend
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Complete daily habits, gain XP in 5 core RPG attributes (Strength, Intellect, Vitality, Discipline, Charisma), maintain your active daily streak, and unlock legacy achievements.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-outline">New Accounts</span>
                  <span className="text-base font-black text-primary mt-0.5">Level 0 Baseline</span>
                  <span className="text-[11px] text-on-surface-variant">+100 Starting Gold</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-outline">Discipline</span>
                  <span className="text-base font-black text-error mt-0.5">Active Streak</span>
                  <span className="text-[11px] text-on-surface-variant">Consecutive Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
