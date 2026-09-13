import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestDrawer } from '../components/quests/QuestDrawer';

export const QuestCreatePage: React.FC = () => {
  const navigate = useNavigate();

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
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Commission New Quest</h1>
          <p className="text-xs text-on-surface-variant">
            Define objectives, difficulty tier, and attribute yields
          </p>
        </div>
      </div>

      <QuestDrawer isOpen={true} onClose={() => navigate('/quests')} />
    </div>
  );
};
