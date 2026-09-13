import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getAvatarAsset } from '../data/avatars';
import { AvatarSelector } from '../components/common/AvatarSelector';
import { calendarService, CalendarStatus } from '../services/calendar';

export const ProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { character, refreshGameData } = useGame();
  const { user, updateUser } = useAuth();
  const { addToast } = useNotifications();

  const [fullName, setFullName] = useState(user?.fullName || character.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaved, setIsSaved] = useState(false);

  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || character.avatar || 'avatar-01');

  // Calendar State
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus | null>(null);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);

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

  const handleConnectCalendar = async () => {
    setIsConnectingCalendar(true);
    try {
      const res = await calendarService.connectCalendar(user?.email);
      if (res.success && res.data) {
        setCalendarStatus(res.data);
        addToast({
          type: 'success',
          title: 'Google Calendar Connected',
          message: 'Quests will automatically sync with your scheduled blocks.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Connection Failed',
        message: 'Could not connect Google Calendar at this time.',
      });
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    setIsConnectingCalendar(true);
    try {
      const res = await calendarService.disconnectCalendar();
      if (res.success && res.data) {
        setCalendarStatus(res.data);
        addToast({
          type: 'info',
          title: 'Google Calendar Disconnected',
          message: 'Calendar synchronization has been terminated.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Disconnection Failed',
        message: 'Could not disconnect Google Calendar.',
      });
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      fullName,
      email,
      phone,
      bio,
    });
    setIsSaved(true);
    addToast({
      type: 'success',
      title: 'Dossier Profile Updated',
      message: 'Your adventurer metadata has been synchronized.',
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveAvatar = async () => {
    await updateUser({ avatar: selectedAvatar });
    await refreshGameData();
    setShowAvatarModal(false);
    addToast({
      type: 'success',
      title: 'Avatar Updated',
      message: 'Your adventurer appearance has been customized.',
    });
  };

  return (
    <div className="px-4 sm:px-8 py-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header Profile Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <img
            src={getAvatarAsset(user?.avatar || character.avatar)}
            alt={fullName}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary-container shadow-md"
          />
          <button
            onClick={() => setShowAvatarModal(true)}
            title="Change Avatar"
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        </div>

        <div className="flex flex-col text-center sm:text-left min-w-0 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              {fullName || 'Adventurer'}
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold">
              {character.rank}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            {user?.classType || 'Apprentice Adventurer'}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-on-surface-variant tabular-nums">
            <span>
              <strong className="text-on-surface">{character.streak}</strong> Day Streak
            </span>
            <span>•</span>
            <span>
              <strong className="text-on-surface">{character.gold.toLocaleString()}</strong> Gold
            </span>
            <span>•</span>
            <span>
              <strong className="text-on-surface">{character.totalXp.toLocaleString()}</strong> Lifetime XP
            </span>
          </div>
        </div>
      </div>

      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl p-6 max-w-2xl w-full border border-outline-variant/40 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Select Character Avatar</h3>
                <p className="text-xs text-on-surface-variant">
                  Choose from the 24 distinct adventurer archetypes
                </p>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <AvatarSelector
              selectedAvatarId={selectedAvatar}
              onSelectAvatar={(id: string) => setSelectedAvatar(id)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-outline hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="px-5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold shadow-sm"
              >
                Apply Avatar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Calendar Integration Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[26px] text-primary">
                calendar_month
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface">Google Calendar Integration</h3>
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
                Automatically synchronize scheduled quests and daily habits with your Google Calendar events.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {calendarStatus?.status === 'CONNECTED' ? (
              <button
                onClick={handleDisconnectCalendar}
                disabled={isConnectingCalendar}
                className="px-4 py-2 rounded-xl border border-error/30 text-error hover:bg-error-container text-xs font-bold transition-all disabled:opacity-50"
              >
                {isConnectingCalendar ? 'Disconnecting...' : 'Disconnect Calendar'}
              </button>
            ) : calendarStatus?.status === 'REAUTHORIZATION_REQUIRED' ? (
              <button
                onClick={handleConnectCalendar}
                disabled={isConnectingCalendar}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>{isConnectingCalendar ? 'Reauthorizing...' : 'Reauthorize Calendar'}</span>
              </button>
            ) : (
              <button
                onClick={handleConnectCalendar}
                disabled={isConnectingCalendar}
                className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>{isConnectingCalendar ? 'Connecting...' : 'Connect Google Calendar'}</span>
              </button>
            )}
          </div>
        </div>

        {calendarStatus?.status === 'REAUTHORIZATION_REQUIRED' && (
          <div className="mt-1 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 animate-fade-in">
            <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">warning</span>
            <div>
              <strong>Reauthorization Required:</strong> Your Google Calendar authorization token has expired or was revoked. Please click &ldquo;Reauthorize Calendar&rdquo; above to re-establish secure read-only access.
            </div>
          </div>
        )}

        {calendarStatus?.status === 'CONNECTED' && (
          <div className="pt-3 border-t border-surface-container-high flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2">
            <span>
              Connected Account: <strong className="text-on-surface">{calendarStatus.accountEmail || user?.email}</strong>
            </span>
            {calendarStatus.lastSync && (
              <span className="text-[11px] text-outline">
                Last synced: {new Date(calendarStatus.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dossier Form */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Adventurer Identification & Security</h2>
            <p className="text-xs text-on-surface-variant">Manage your credentials and transmission dossier</p>
          </div>
          {isSaved && (
            <span className="px-3 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check</span>
              <span>Saved</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <label className="text-xs font-bold text-on-surface">Registered Dossier Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm focus:border-primary-container focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Phone Number (2FA Alerts)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (555) 019-2834"
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm focus:border-primary-container focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Character Title & Honorific</label>
            <input
              disabled
              type="text"
              value={character.title}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-sm text-outline cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-on-surface">Adventurer Manifesto / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="State your personal mission, life philosophy, or habit targets..."
              className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm focus:border-primary-container focus:outline-none resize-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-sm shadow-sm transition-all"
            >
              Save Dossier Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
