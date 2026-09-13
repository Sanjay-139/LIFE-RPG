import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useNotifications } from '../context/NotificationContext';
import { AttributeKey } from '../types';
import { AvatarSelector } from '../components/common/AvatarSelector';

export const OnboardingPage: React.FC = () => {
  const { user, updateUser, completeOnboarding } = useAuth();
  const { createQuest } = useGame();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [characterName, setCharacterName] = useState(user?.fullName || 'New Adventurer');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar-01');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Coding', 'Fitness']);
  const [archetype, setArchetype] = useState('Warrior');
  const [firstQuestTitle, setFirstQuestTitle] = useState('Complete 45-Minute Deep Focus Session & 30m Workout');
  const [firstQuestAttr, setFirstQuestAttr] = useState<AttributeKey>('intellect');

  const goalsList = [
    'Study',
    'Coding',
    'Fitness',
    'Reading',
    'Health',
    'Career',
    'Personal Development',
    'Other',
  ];

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleFinish = async () => {
    // 1. Commission first quest
    if (firstQuestTitle.trim()) {
      await createQuest({
        title: firstQuestTitle.trim(),
        description: 'First commissioned quest from initiation protocol.',
        category: 'coding',
        difficulty: 'medium',
        xpReward: 70,
        goldReward: 35,
        targetAttribute: firstQuestAttr,
        dueDate: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        estimatedDuration: 45,
      });
    }

    // 2. Update user profile with real avatar ID
    await updateUser({
      fullName: characterName,
      avatar: selectedAvatar,
      classType: `${archetype} Adventurer`,
    });
    await completeOnboarding();

    addToast({
      type: 'success',
      title: 'YOUR JOURNEY BEGINS!',
      message: 'Level 0 Baseline Initialized. First quest ready on your board.',
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        {/*  */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === s
                    ? 'bg-primary-container text-on-primary ring-4 ring-primary-fixed'
                    : step > s
                    ? 'bg-tertiary text-on-tertiary'
                    : 'bg-surface-container text-outline'
                }`}
              >
                {step > s ? <span className="material-symbols-outlined text-[16px]">check</span> : s}
              </div>
              {s < 5 && (
                <div
                  className={`w-8 sm:w-16 h-1 rounded ${
                    step > s ? 'bg-tertiary' : 'bg-surface-container-high'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/40 p-6 sm:p-10 flex flex-col gap-6">
          {/*  */}
          {step === 1 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">badge</span>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Choose Your Adventurer Name</h2>
                  <p className="text-xs text-on-surface-variant">
                    This is your formal identity inside the LIFE RPG telemetry network.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-bold text-on-surface uppercase">Character Handle</label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="e.g. Arion Vance"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-base font-semibold focus:border-primary-container focus:outline-none shadow-sm"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!characterName.trim()}
                type="button"
                className="w-full mt-4 py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-sm shadow-sm transition-all"
              >
                Continue to Avatar Selection
              </button>
            </div>
          )}

          {/* Step 2: Choose Avatar */}
          {step === 2 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">
                  face_retouching_natural
                </span>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Select Character Avatar</h2>
                  <p className="text-xs text-on-surface-variant">
                    Choose your circular RPG protagonist representation from the 24-avatar archive.
                  </p>
                </div>
              </div>

              <div className="my-2">
                <AvatarSelector
                  selectedAvatarId={selectedAvatar}
                  onSelectAvatar={setSelectedAvatar}
                  showPreview={true}
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  type="button"
                  className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-bold text-sm hover:bg-primary transition-all shadow-sm"
                >
                  Confirm Avatar
                </button>
              </div>
            </div>
          )}

          {/*  */}
          {step === 3 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">flag</span>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Select Life Domains</h2>
                  <p className="text-xs text-on-surface-variant">
                    Pick the real-world areas you want to transform into gamified progression vectors.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-2">
                {goalsList.map((goal) => {
                  const active = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                        active
                          ? 'bg-primary-container text-on-primary border-primary-container shadow-sm'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      <span>{goal}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {active ? 'check' : 'add'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={() => setStep(2)}
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  type="button"
                  disabled={selectedGoals.length === 0}
                  className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-bold text-sm hover:bg-primary transition-all shadow-sm disabled:opacity-50"
                >
                  Lock In Focus Areas
                </button>
              </div>
            </div>
          )}

          {/*  */}
          {step === 4 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">
                  psychology
                </span>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Select Starting Archetype</h2>
                  <p className="text-xs text-on-surface-variant">
                    Your archetype determines your starting attribute bonus affinity.
                  </p>
                </div>
              </div>

              <div className="space-y-3 my-2">
                {[
                  {
                    id: 'Sage',
                    title: 'The Sage (Intellect & Discipline)',
                    desc: 'Prioritizes coding, algorithms, system architecture, and deep focus sessions.',
                    icon: 'psychology',
                    color: 'text-violet-700',
                  },
                  {
                    id: 'Vanguard',
                    title: 'The Vanguard (Strength & Vitality)',
                    desc: 'Focuses on intense physical conditioning, endurance, and daily discipline.',
                    icon: 'fitness_center',
                    color: 'text-amber-700',
                  },
                  {
                    id: 'Paragon',
                    title: 'The Paragon (Balanced Hybrid)',
                    desc: 'Even distribution across Intellect, Strength, and Daily Consistency.',
                    icon: 'balance',
                    color: 'text-primary',
                  },
                ].map((arch) => (
                  <div
                    key={arch.id}
                    onClick={() => setArchetype(arch.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      archetype === arch.id
                        ? 'border-primary-container bg-primary-fixed/20 shadow-sm'
                        : 'border-outline-variant/30 hover:border-outline-variant'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[24px] ${arch.color}`}>
                      {arch.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-on-surface">{arch.title}</span>
                      <p className="text-xs text-on-surface-variant mt-0.5">{arch.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={() => setStep(3)}
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  type="button"
                  className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-bold text-sm hover:bg-primary transition-all shadow-sm"
                >
                  Continue to First Quest
                </button>
              </div>
            </div>
          )}

          {/*  */}
          {step === 5 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[32px]">swords</span>
                </div>
                <h2 className="text-2xl font-black text-on-surface">YOUR JOURNEY BEGINS</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold my-2">
                  <span>LEVEL 1 ADVENTURER INITIATION</span>
                </div>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                  Commission your very first real-world quest to establish your baseline streak.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface">First Quest Title</label>
                  <input
                    type="text"
                    value={firstQuestTitle}
                    onChange={(e) => setFirstQuestTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary-container"
                    placeholder="e.g. Solve 1 DP problem and run 2km"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-outline font-medium">Yield:</span>
                  <div className="flex items-center gap-2 font-bold tabular-nums">
                    <span className="text-primary">+70 XP</span>
                    <span className="text-secondary">+35 Gold</span>
                    <span className="text-error">🔥 Streak +1</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                type="button"
                className="w-full mt-4 py-3.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-black text-base shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>CREATE YOUR FIRST QUEST</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
