import React from 'react';
import { Quest } from '../../types';
import { Badge } from '../common/Badge';
import { useGame } from '../../context/GameContext';
import { useNavigate } from 'react-router-dom';

interface QuestCardProps {
  quest: Quest;
  onEdit?: (quest: Quest) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onEdit }) => {
  const { completeQuest, deleteQuest } = useGame();
  const navigate = useNavigate();

  const isCompleted = quest.status === 'completed';
  const isOverdue =
    quest.status !== 'completed' &&
    new Date(quest.dueDate).getTime() < Date.now();

  const formatDueDate = (iso: string) => {
    try {
      const date = new Date(iso);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      if (isToday) {
        return `Due Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return `Due ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Due Today';
    }
  };

  return (
    <div
      className={`group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-surface-container-lowest/70 border-outline-variant/30 opacity-80'
          : 'bg-surface-container-lowest border-outline-variant/40 hover:border-primary/40 shadow-card hover:shadow-card-hover'
      }`}
    >
      {/*  */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <button
          onClick={() => !isCompleted && completeQuest(quest.id)}
          disabled={isCompleted}
          type="button"
          aria-label={isCompleted ? 'Completed quest' : 'Mark quest complete'}
          className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center transition-all shrink-0 ${
            isCompleted
              ? 'bg-tertiary text-on-tertiary'
              : 'border-2 border-outline-variant hover:border-primary-container text-transparent hover:text-primary-container cursor-pointer'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isCompleted ? 'check' : 'check'}
          </span>
        </button>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {/*  */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate(`/quests/${quest.id}`)}
              className={`text-left font-semibold text-sm sm:text-base leading-snug tracking-tight hover:text-primary transition-colors truncate max-w-lg ${
                isCompleted
                  ? 'line-through text-outline'
                  : 'text-on-surface'
              }`}
            >
              {quest.title}
            </button>

            <Badge variant={quest.targetAttribute}>
              {quest.targetAttribute}
            </Badge>

            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-medium uppercase">
              {quest.difficulty} Tier
            </span>

            {isOverdue && (
              <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-[11px] font-bold uppercase">
                Overdue
              </span>
            )}
          </div>

          {/*  */}
          {quest.description && (
            <p className="text-xs text-on-surface-variant line-clamp-1 max-w-2xl">
              {quest.description}
            </p>
          )}

          {/*  */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant mt-1">
            <span className="flex items-center gap-1 text-primary font-medium">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>{formatDueDate(quest.dueDate)}</span>
            </span>

            <span className="text-outline">•</span>
            <span>Target: {quest.estimatedDuration}m</span>

            {quest.subtasks && quest.subtasks.length > 0 && (
              <>
                <span className="text-outline">•</span>
                <span className="font-medium text-on-surface tabular-nums">
                  {quest.subtasks.filter((s) => s.completed).length}/{quest.subtasks.length} subtasks
                </span>
              </>
            )}

            {isCompleted && quest.completedAt && (
              <span className="text-tertiary font-medium">
                • Done {new Date(quest.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/*  */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 mt-3 md:mt-0 pt-3 md:pt-0 border-t border-surface-container-high md:border-0">
        <div className="flex items-center gap-1.5 tabular-nums">
          <span className="px-2.5 py-1 rounded bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold">
            +{quest.xpReward} XP
          </span>
          <span className="px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
            +{quest.goldReward} G
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!isCompleted ? (
            <button
              onClick={() => completeQuest(quest.id)}
              type="button"
              className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold hover:bg-primary shadow-sm transition-all active:scale-95 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">swords</span>
              <span>Complete</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded bg-surface-container text-tertiary text-xs font-bold inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Claimed</span>
            </span>
          )}

          {onEdit && !isCompleted && (
            <button
              onClick={() => onEdit(quest)}
              type="button"
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Edit Quest"
              aria-label="Edit Quest"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          )}

          <button
            onClick={() => deleteQuest(quest.id)}
            type="button"
            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container transition-colors"
            title="Abandon Quest"
            aria-label="Abandon Quest"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
