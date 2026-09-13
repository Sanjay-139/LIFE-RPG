import React from 'react';
import { useGame } from '../../context/GameContext';
import { useNavigate } from 'react-router-dom';

export const LevelUpModal: React.FC = () => {
  const { levelUpCelebration, dismissLevelUp } = useGame();
  const navigate = useNavigate();

  if (!levelUpCelebration) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in"
      onClick={dismissLevelUp}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-modal border border-primary-container p-6 sm:p-8 text-center flex flex-col items-center animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/*  */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary-container shadow-md">
            <span className="material-symbols-outlined text-[42px]">military_tech</span>
          </div>
          <span className="absolute -bottom-2 bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow">
            Ascension
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mb-1">
          LEVEL UP!
        </h2>
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-6">
          Adventurer Progression Milestone Reached
        </p>

        {/*  */}
        <div className="w-full bg-surface-container-low rounded-xl p-4 flex items-center justify-center gap-4 mb-6 tabular-nums">
          <div className="flex flex-col items-center">
            <span className="text-xs text-outline font-medium uppercase">Previous</span>
            <span className="text-xl font-bold text-on-surface-variant">
              LVL {levelUpCelebration.previousLevel}
            </span>
          </div>
          <span className="material-symbols-outlined text-primary text-[28px]">
            arrow_forward
          </span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-primary font-bold uppercase">New Level</span>
            <span className="text-2xl font-black text-primary">
              LVL {levelUpCelebration.newLevel}
            </span>
          </div>
        </div>

        {/*  */}
        <div className="w-full space-y-2.5 mb-8 text-left">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-tertiary-fixed/40 border border-tertiary-fixed">
            <div className="w-8 h-8 rounded bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">
                +{levelUpCelebration.attributePointsGained} Attribute Points Ready
              </span>
              <span className="text-xs text-on-surface-variant">
                Allocate to Strength, Intellect, Discipline, or Vitality
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary-fixed/40 border border-secondary-fixed">
            <div className="w-8 h-8 rounded bg-secondary text-on-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">New Bazaar Tier Unlocked</span>
              <span className="text-xs text-on-surface-variant">
                Check Rewards shop for level {levelUpCelebration.newLevel} equipment
              </span>
            </div>
          </div>
        </div>

        {/*  */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              dismissLevelUp();
              navigate('/character/attributes');
            }}
            type="button"
            className="py-2.5 px-4 rounded-lg bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors"
          >
            Allocate Points
          </button>
          <button
            onClick={dismissLevelUp}
            type="button"
            className="py-2.5 px-4 rounded-lg bg-primary-container text-on-primary font-bold text-sm hover:opacity-95 shadow-sm transition-all"
          >
            Continue Journey
          </button>
        </div>
      </div>
    </div>
  );
};
