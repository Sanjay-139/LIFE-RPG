import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useNotifications } from '../context/NotificationContext';
import { AvatarSelector } from '../components/common/AvatarSelector';
import { getAvatarAsset } from '../data/avatars';
import { calendarService, CalendarStatus } from '../services/calendar';

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateUser, logout } = useAuth();
  const { character, refreshGameData } = useGame();
  const { addToast } = useNotifications();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || character.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Avatar Selection State
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || character.avatar || 'avatar-01');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  // Calendar State
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus | null>(null);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);

  // Preferences (stored in localStorage)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('liferpg_sound') !== 'false';
  });
  const [celebrationEnabled, setCelebrationEnabled] = useState(() => {
    return localStorage.getItem('liferpg_celebrations') !== 'false';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('liferpg_notifications') !== 'false';
  });

  useEffect(() => {
    calendarService.getCalendarStatus().then((res) => {
      if (res.success && res.data) {
        setCalendarStatus(res.data);
      }
    });

    const calendarParam = searchParams.get('calendar');
    if (calendarParam === 'connected') {
      addToast({
        type: 'success',
        title: 'Google Calendar Connected',
        message: 'Your Google Calendar is now securely linked in read-only mode.',
      });
      searchParams.delete('calendar');
      setSearchParams(searchParams, { replace: true });
    } else if (calendarParam === 'error') {
      const msg = searchParams.get('message') || 'Google Calendar authorization failed or was denied.';
      addToast({
        type: 'error',
        title: 'Calendar Connection Failed',
        message: msg,
      });
      searchParams.delete('calendar');
      searchParams.delete('message');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, addToast]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateUser({
        fullName,
        email,
        phone,
        bio,
      });
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your adventurer dossier profile has been updated.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update profile at this time.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleApplyAvatar = async () => {
    setIsSavingAvatar(true);
    try {
      await updateUser({ avatar: selectedAvatar });
      await refreshGameData();
      addToast({
        type: 'success',
        title: 'Avatar Applied',
        message: 'Your adventurer representation has been refreshed.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Avatar Update Failed',
        message: 'Could not update avatar.',
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleConnectCalendar = async () => {
    setIsSyncingCalendar(true);
    try {
      const res = await calendarService.connectCalendar(user?.email);
      if (res.success && res.data) {
        setCalendarStatus(res.data);
        addToast({
          type: 'success',
          title: 'Google Calendar Connected',
          message: 'Quests and schedules are now synchronized.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect Google Calendar.',
      });
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    setIsSyncingCalendar(true);
    try {
      const res = await calendarService.disconnectCalendar();
      if (res.success && res.data) {
        setCalendarStatus(res.data);
        addToast({
          type: 'info',
          title: 'Calendar Disconnected',
          message: 'Google Calendar sync has been paused.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Disconnection Error',
        message: 'Failed to disconnect Google Calendar.',
      });
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('liferpg_sound', String(next));
  };

  const toggleCelebration = () => {
    const next = !celebrationEnabled;
    setCelebrationEnabled(next);
    localStorage.setItem('liferpg_celebrations', String(next));
  };

  const toggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem('liferpg_notifications', String(next));
  };

  return (
    <div className="px-4 sm:px-8 py-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-outline uppercase font-bold tracking-wider">
              Control Panel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-0.5">
            System & Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Manage your adventurer dossier, 24-avatar identity, Google Calendar sync, and interface preferences.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl border border-error/40 text-error hover:bg-error-container text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>

      {/* Section 1: Character Avatar Registry */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container-high pb-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={getAvatarAsset(selectedAvatar)}
                alt="Selected Avatar"
                className="w-16 h-16 rounded-full object-cover border-4 border-primary-container shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-primary-container text-on-primary text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                LVL {character.level}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Character Avatar Selection</h2>
              <p className="text-xs text-on-surface-variant">
                Select your persona from the 24 local high-definition vector avatars
              </p>
            </div>
          </div>

          <button
            onClick={handleApplyAvatar}
            disabled={isSavingAvatar || selectedAvatar === (user?.avatar || character.avatar)}
            className="px-5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold shadow-sm transition-all disabled:opacity-40"
          >
            {isSavingAvatar ? 'Applying...' : 'Apply Avatar'}
          </button>
        </div>

        <AvatarSelector
          selectedAvatarId={selectedAvatar}
          onSelectAvatar={(id: string) => setSelectedAvatar(id)}
        />
      </div>

      {/* Section 2: Google Account & Google Calendar */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-6">
        <div className="border-b border-surface-container-high pb-4">
          <h2 className="text-lg font-bold text-on-surface">Integrations & External Services</h2>
          <p className="text-xs text-on-surface-variant">
            Connect your productivity ecosystems for seamless real-world quest execution
          </p>
        </div>

        {/* Google Calendar Card */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center shrink-0 border border-outline-variant/40 shadow-sm">
                <span className="material-symbols-outlined text-[26px] text-primary">
                  calendar_month
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-on-surface">Google Calendar Sync</h3>
                  {calendarStatus?.status === 'CONNECTED' ? (
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                      CONNECTED
                    </span>
                  ) : calendarStatus?.status === 'REAUTHORIZATION_REQUIRED' ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-[10px] font-bold">
                      ACTION REQUIRED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-outline text-[10px] font-bold">
                      NOT CONNECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Two-way synchronization for time-blocked quests, habits, and daily deadlines.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {calendarStatus?.status === 'CONNECTED' ? (
                <button
                  onClick={handleDisconnectCalendar}
                  disabled={isSyncingCalendar}
                  className="px-4 py-2 rounded-xl border border-error/30 text-error hover:bg-error-container text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSyncingCalendar ? 'Disconnecting...' : 'Disconnect'}
                </button>
              ) : calendarStatus?.status === 'REAUTHORIZATION_REQUIRED' ? (
                <button
                  onClick={handleConnectCalendar}
                  disabled={isSyncingCalendar}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>{isSyncingCalendar ? 'Reauthorizing...' : 'Reauthorize Calendar'}</span>
                </button>
              ) : (
                <button
                  onClick={handleConnectCalendar}
                  disabled={isSyncingCalendar}
                  className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  <span>{isSyncingCalendar ? 'Connecting...' : 'Connect Calendar'}</span>
                </button>
              )}
            </div>
          </div>

          {calendarStatus?.status === 'REAUTHORIZATION_REQUIRED' && (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">warning</span>
              <div>
                <strong>Reauthorization Required:</strong> Your Google Calendar authorization token has expired or was revoked. Please click &ldquo;Reauthorize Calendar&rdquo; above to re-establish secure read-only access.
              </div>
            </div>
          )}

          {calendarStatus?.status === 'CONNECTED' && (
            <div className="pt-3 border-t border-outline-variant/30 flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2">
              <span>
                Account: <strong className="text-on-surface">{calendarStatus.accountEmail || user?.email}</strong>
              </span>
              {calendarStatus.lastSync && (
                <span className="text-[11px] text-outline">
                  Last sync: {new Date(calendarStatus.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Profile Dossier Form */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-6">
        <div className="border-b border-surface-container-high pb-4">
          <h2 className="text-lg font-bold text-on-surface">Adventurer Dossier Information</h2>
          <p className="text-xs text-on-surface-variant">Update your public credentials and bio</p>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Full Dossier Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm focus:border-primary-container focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Registered Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm focus:border-primary-container focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Phone Number (2FA)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (555) 019-2834"
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm focus:border-primary-container focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Adventurer Title</label>
            <input
              disabled
              type="text"
              value={character.title}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-sm text-outline cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-on-surface">Adventurer Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="State your personal mission, philosophy, or focus areas..."
              className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm focus:border-primary-container focus:outline-none resize-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {isSavingProfile ? 'Saving...' : 'Save Dossier Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 4: Preferences */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-6">
        <div className="border-b border-surface-container-high pb-4">
          <h2 className="text-lg font-bold text-on-surface">Interface & Gamification Preferences</h2>
          <p className="text-xs text-on-surface-variant">Customize auditory and sensory gamification feedback</p>
        </div>

        <div className="flex flex-col divide-y divide-surface-container-high">
          <div className="py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-on-surface">Sound FX & Audio Cues</p>
              <p className="text-xs text-on-surface-variant">Play celebratory audio cues upon quest completion</p>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-primary-container' : 'bg-surface-container-high'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-on-surface">Confetti & Level-Up Visuals</p>
              <p className="text-xs text-on-surface-variant">Display celebratory canvas confetti animations on level-up</p>
            </div>
            <button
              onClick={toggleCelebration}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                celebrationEnabled ? 'bg-primary-container' : 'bg-surface-container-high'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  celebrationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-on-surface">Notification Reminders</p>
              <p className="text-xs text-on-surface-variant">Show in-app toast alerts for overdue quests and daily missions</p>
            </div>
            <button
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                notificationsEnabled ? 'bg-primary-container' : 'bg-surface-container-high'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
