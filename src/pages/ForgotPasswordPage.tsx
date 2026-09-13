import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export const ForgotPasswordPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast({
      type: 'info',
      title: 'Recovery Signal Broadcasted',
      message: `If ${email} is registered, a cryptographic key reset link has been dispatched.`,
    });
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/40 p-8 flex flex-col gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">key</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">
              Recover Authentication Key
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Enter your registered dossier email to receive key reset instructions.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.vance@workplace.io"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-sm shadow-md transition-all active:scale-[0.99]"
              >
                Send Recovery Key
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed text-center space-y-2">
              <span className="material-symbols-outlined text-tertiary text-[28px]">
                mark_email_read
              </span>
              <p className="text-xs text-on-surface-variant font-medium">
                Transmission sent to <strong>{email}</strong>. Check your inbox to re-establish node
                connection.
              </p>
            </div>
          )}

          <div className="text-center text-xs text-on-surface-variant border-t border-surface-container-high pt-4">
            Remembered key?
            <Link to="/login" className="font-bold text-primary hover:underline ml-1">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
