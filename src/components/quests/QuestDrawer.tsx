import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { AttributeKey, QuestCategory, QuestDifficulty } from '../../types';

interface QuestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestDrawer: React.FC<QuestDrawerProps> = ({ isOpen, onClose }) => {
  const { createQuest } = useGame();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAttribute, setTargetAttribute] = useState<AttributeKey>('intellect');
  const [category, setCategory] = useState<QuestCategory>('coding');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium');
  const [xpReward, setXpReward] = useState(70);
  const [goldReward, setGoldReward] = useState(35);
  const [estimatedDuration, setEstimatedDuration] = useState(45);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 6);
    return d.toISOString().slice(0, 16);
  });
  const [repeatSchedule, setRepeatSchedule] = useState<'none' | 'daily' | 'weekly'>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDifficultyChange = (diff: QuestDifficulty) => {
    setDifficulty(diff);
    switch (diff) {
      case 'easy':
        setXpReward(35);
        setGoldReward(15);
        setEstimatedDuration(20);
        break;
      case 'medium':
        setXpReward(70);
        setGoldReward(35);
        setEstimatedDuration(45);
        break;
      case 'hard':
        setXpReward(120);
        setGoldReward(60);
        setEstimatedDuration(75);
        break;
      case 'epic':
        setXpReward(250);
        setGoldReward(125);
        setEstimatedDuration(120);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const success = await createQuest({
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      xpReward: Number(xpReward),
      goldReward: Number(goldReward),
      targetAttribute,
      dueDate: new Date(dueDate).toISOString(),
      estimatedDuration: Number(estimatedDuration),
      repeatSchedule,
    });

    setIsSubmitting(false);
    if (success) {
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-4 animate-slide-down">
      <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">assignment_add</span>
          </div>
          <div>
            <h2 className="font-bold text-base text-on-surface">Commission New Quest</h2>
            <p className="text-xs text-outline">Specify mission constraints and yield telemetry</p>
          </div>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Close form"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
        {/*  */}
        <div className="flex flex-col gap-1.5 md:col-span-8">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Quest Designation *
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container shadow-sm"
            placeholder="e.g. Master Topological Sort & Kahn's Algorithm"
            type="text"
          />
        </div>

        {/*  */}
        <div className="flex flex-col gap-1.5 md:col-span-4">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Target Attribute
          </label>
          <select
            value={targetAttribute}
            onChange={(e) => setTargetAttribute(e.target.value as AttributeKey)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="intellect">Intellect (+INT)</option>
            <option value="strength">Strength (+STR)</option>
            <option value="vitality">Vitality (+VIT)</option>
            <option value="discipline">Discipline (+DIS)</option>
            <option value="charisma">Charisma (+CHA)</option>
          </select>
        </div>

        {/*  */}
        <div className="flex flex-col gap-1.5 md:col-span-12">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Mission Brief / Acceptance Criteria
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm resize-none placeholder:text-outline"
            placeholder="Specify problem numbers, physical reps, reading chapters, or measurable completion conditions..."
          />
        </div>

        {/*  */}
        <div className="flex flex-col gap-1.5 md:col-span-3">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Difficulty Tier
          </label>
          <select
            value={difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value as QuestDifficulty)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="easy">Easy (35 XP)</option>
            <option value="medium">Medium (70 XP)</option>
            <option value="hard">Hard (120 XP)</option>
            <option value="epic">Epic (250 XP)</option>
          </select>
        </div>

        {/*  */}
        <div className="flex flex-col gap-1.5 md:col-span-3">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as QuestCategory)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="coding">Coding</option>
            <option value="study">Study</option>
            <option value="fitness">Fitness</option>
            <option value="reading">Reading</option>
            <option value="health">Health</option>
            <option value="career">Career</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/*  */}
        <div className="flex flex-col gap-1.5 md:col-span-3">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Experience (XP)
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min={10}
              max={1000}
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm tabular-nums"
            />
            <span className="absolute right-3 text-xs font-bold text-primary">XP</span>
          </div>
        </div>

        {/*  */}
        <div className="flex flex-col gap-1.5 md:col-span-3">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Gold Yield
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min={5}
              max={500}
              value={goldReward}
              onChange={(e) => setGoldReward(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm tabular-nums"
            />
            <span className="absolute right-3 text-xs font-bold text-secondary">G</span>
          </div>
        </div>

        {/*  */}
        <div className="flex flex-col gap-1.5 md:col-span-6">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Deadline Target
          </label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm"
          />
        </div>

        {/*  */}
        <div className="flex flex-col gap-1.5 md:col-span-3">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Duration (min)
          </label>
          <input
            type="number"
            min={5}
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(Number(e.target.value))}
            className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm tabular-nums"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-3">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Repeat
          </label>
          <select
            value={repeatSchedule}
            onChange={(e) => setRepeatSchedule(e.target.value as 'none' | 'daily' | 'weekly')}
            className="w-full px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:border-primary-container focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="none">One-time</option>
            <option value="daily">Daily Habit</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {/*  */}
        <div className="flex items-center justify-end gap-3 md:col-span-12 pt-2 border-t border-surface-container-high">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-5 py-2 rounded-lg bg-primary-container text-on-primary text-sm font-bold hover:bg-primary shadow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Commissioning...' : 'Add to Quest Board'}
          </button>
        </div>
      </form>
    </div>
  );
};
