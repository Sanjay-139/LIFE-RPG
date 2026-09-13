import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { QuestCard } from '../components/quests/QuestCard';
import { QuestDrawer } from '../components/quests/QuestDrawer';
import { EmptyState } from '../components/common/EmptyState';
import { AttributeKey, Quest } from '../types';
import { Modal } from '../components/common/Modal';

export const QuestsPage: React.FC = () => {
  const { quests, updateQuest } = useGame();

  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  // Filter quests
  const filteredQuests = quests.filter((q) => {
    // Tab filter
    if (activeTab === 'active' && q.status === 'completed') return false;
    if (activeTab === 'completed' && q.status !== 'completed') return false;
    if (activeTab === 'upcoming' && q.status !== 'not_started') return false;

    // Attribute filter
    if (selectedAttribute !== 'all' && q.targetAttribute !== selectedAttribute) return false;

    return true;
  });

  const activeCount = quests.filter((q) => q.status !== 'completed').length;
  const completedCount = quests.filter((q) => q.status === 'completed').length;
  const upcomingCount = quests.filter((q) => q.status === 'not_started').length;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuest) return;
    updateQuest(editingQuest.id, editingQuest);
    setEditingQuest(null);
  };

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/*  */}
      <div className="flex flex-col gap-5 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-container" />
              <span className="text-xs text-outline uppercase font-bold tracking-wider">
                Mission Operations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-0.5">
              Quest Board & Tasks
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/*  */}
            <div className="flex bg-surface-container p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'active'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Upcoming ({upcomingCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'completed'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/*  */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              type="button"
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-primary active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create Quest</span>
            </button>
          </div>
        </div>

        {/*  */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedAttribute('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              selectedAttribute === 'all'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span>All Quests</span>
            <span className="px-1.5 py-0.2 rounded bg-primary/20 text-[10px] tabular-nums">
              {quests.length}
            </span>
          </button>

          {[
            { key: 'strength', label: 'Strength', icon: 'fitness_center', color: 'text-amber-700' },
            { key: 'intellect', label: 'Intellect', icon: 'psychology', color: 'text-violet-700' },
            { key: 'vitality', label: 'Vitality', icon: 'spa', color: 'text-sky-700' },
            { key: 'discipline', label: 'Discipline', icon: 'hourglass_top', color: 'text-emerald-700' },
            { key: 'charisma', label: 'Charisma', icon: 'palette', color: 'text-rose-700' },
          ].map((attr) => (
            <button
              key={attr.key}
              type="button"
              onClick={() => setSelectedAttribute(attr.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedAttribute === attr.key
                  ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${attr.color}`}>
                {attr.icon}
              </span>
              <span>{attr.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/*  */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-surface-container-high/80 rounded-xl border border-outline-variant/30 text-on-surface-variant">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <p className="text-xs leading-relaxed">
            <strong className="font-bold text-on-surface">Progression Protocol:</strong>{' '}
            Completing a quest immediately yields Experience Points, Gold currency, and class
            attributes. All calculations trigger instantaneous telemetry updates.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-primary text-xs font-bold whitespace-nowrap">
          <span>Daily Target: {activeCount} Tasks Pending</span>
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
        </div>
      </div>

      {/*  */}
      {drawerOpen && (
        <QuestDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      {/*  */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">today</span>
            <h2 className="font-bold text-lg text-on-surface capitalize">
              {activeTab} Missions ({filteredQuests.length})
            </h2>
          </div>
          <span className="text-xs text-outline">Sorted by time critical</span>
        </div>

        {filteredQuests.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onEdit={(q) => setEditingQuest({ ...q })}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="checklist"
            title={`NO ${activeTab.toUpperCase()} MISSIONS FOUND`}
            subtitle="Every legend starts with one quest."
            actionText="Commission New Quest"
            onAction={() => setDrawerOpen(true)}
          />
        )}
      </div>

      {/*  */}
      {editingQuest && (
        <Modal
          isOpen={!!editingQuest}
          onClose={() => setEditingQuest(null)}
          title="Edit Quest Parameters"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Quest Title</label>
              <input
                type="text"
                required
                value={editingQuest.title}
                onChange={(e) => setEditingQuest({ ...editingQuest, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Description / Brief</label>
              <textarea
                rows={2}
                value={editingQuest.description}
                onChange={(e) =>
                  setEditingQuest({ ...editingQuest, description: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">XP Reward</label>
                <input
                  type="number"
                  value={editingQuest.xpReward}
                  onChange={(e) =>
                    setEditingQuest({ ...editingQuest, xpReward: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm tabular-nums"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Gold Reward</label>
                <input
                  type="number"
                  value={editingQuest.goldReward}
                  onChange={(e) =>
                    setEditingQuest({ ...editingQuest, goldReward: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm tabular-nums"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setEditingQuest(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-bold hover:bg-primary shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
