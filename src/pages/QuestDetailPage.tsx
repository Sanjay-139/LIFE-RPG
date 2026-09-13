import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const QuestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { quests, completeQuest, deleteQuest, updateQuest } = useGame();
  const navigate = useNavigate();

  const quest = quests.find((q) => q.id === id);
  const [subtasks, setSubtasks] = useState(quest?.subtasks || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(quest?.title || '');
  const [editDesc, setEditDesc] = useState(quest?.description || '');

  if (!quest) {
    return (
      <div className="px-4 sm:px-8 py-12 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-bold text-on-surface">Quest Not Found</h2>
        <p className="text-sm text-on-surface-variant mt-2 mb-6">
          This mission was either completed, expired, or decommissioned.
        </p>
        <button
          onClick={() => navigate('/quests')}
          className="px-4 py-2 bg-primary-container text-on-primary rounded-lg font-bold text-sm"
        >
          Return to Quest Board
        </button>
      </div>
    );
  }

  const isCompleted = quest.status === 'completed';

  const toggleSubtask = (stId: string) => {
    const updated = subtasks.map((s) => (s.id === stId ? { ...s, completed: !s.completed } : s));
    setSubtasks(updated);
    updateQuest(quest.id, { subtasks: updated });
  };

  const handleSaveEdit = () => {
    updateQuest(quest.id, { title: editTitle, description: editDesc });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteQuest(quest.id);
    navigate('/quests');
  };

  return (
    <div className="px-4 sm:px-8 py-6 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/quests')}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-outline uppercase tracking-wider">
            Quest Dossier
          </span>
          <span className="text-outline">•</span>
          <span className="text-xs font-mono text-primary font-bold">#{quest.id}</span>
        </div>
      </div>

      {/*  */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-card flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-surface-container-high pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={quest.targetAttribute}>{quest.targetAttribute}</Badge>
              <span className="px-2.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-xs font-semibold uppercase">
                {quest.difficulty} Tier
              </span>
              <span className="px-2.5 py-0.5 rounded bg-surface-container-high text-on-surface text-xs font-bold uppercase">
                {quest.category}
              </span>
              {isCompleted && (
                <span className="px-2.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  <span>Completed</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
              {quest.title}
            </h1>
          </div>

          {/*  */}
          <div className="flex items-center gap-2 shrink-0 tabular-nums">
            <div className="px-3.5 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed-variant text-sm font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>+{quest.xpReward} XP</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-secondary-fixed text-on-secondary-fixed text-sm font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                monetization_on
              </span>
              <span>+{quest.goldReward} G</span>
            </div>
          </div>
        </div>

        {/*  */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-outline uppercase tracking-wider">
            Mission Objective & Brief
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
            {quest.description || 'No specific mission criteria documented. Standard completion yields full telemetry rewards.'}
          </p>
        </div>

        {/*  */}
        {subtasks.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-outline uppercase tracking-wider">
                Acceptance Criteria Subroutines
              </h3>
              <span className="text-xs font-bold text-primary tabular-nums">
                {subtasks.filter((s) => s.completed).length} / {subtasks.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => !isCompleted && toggleSubtask(st.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    !isCompleted ? 'cursor-pointer hover:border-primary-container' : ''
                  } ${
                    st.completed
                      ? 'bg-tertiary-fixed/20 border-tertiary-fixed text-outline line-through'
                      : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      st.completed
                        ? 'bg-tertiary text-on-tertiary'
                        : 'border border-outline text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <span className="text-xs font-semibold">{st.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/*  */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
          <div>
            <span className="text-outline uppercase text-[10px] font-bold">Estimated Time</span>
            <p className="font-bold text-on-surface mt-0.5">{quest.estimatedDuration} Minutes</p>
          </div>
          <div>
            <span className="text-outline uppercase text-[10px] font-bold">Target Attribute</span>
            <p className="font-bold text-on-surface capitalize mt-0.5">{quest.targetAttribute}</p>
          </div>
          <div>
            <span className="text-outline uppercase text-[10px] font-bold">Deadline</span>
            <p className="font-bold text-on-surface mt-0.5">
              {new Date(quest.dueDate).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <span className="text-outline uppercase text-[10px] font-bold">Repeat Schedule</span>
            <p className="font-bold text-on-surface capitalize mt-0.5">
              {quest.repeatSchedule || 'One-time'}
            </p>
          </div>
        </div>

        {/*  */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-container-high">
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button
                onClick={() => setIsEditing(true)}
                type="button"
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Edit Quest</span>
              </button>
            )}
            <button
              onClick={handleDelete}
              type="button"
              className="px-4 py-2 rounded-lg text-error hover:bg-error-container/30 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Abandon Quest</span>
            </button>
          </div>

          {!isCompleted ? (
            <button
              onClick={() => completeQuest(quest.id)}
              type="button"
              className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:bg-primary shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">swords</span>
              <span>Complete Quest & Claim Telemetry</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-tertiary font-bold text-xs bg-tertiary-fixed/40 px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Mission Successfully Cleared</span>
            </div>
          )}
        </div>
      </div>

      {/*  */}
      {isEditing && (
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Quest">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-on-surface">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface">Description</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-sm mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
