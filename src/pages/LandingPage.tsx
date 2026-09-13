import React from 'react';
import { NavLink } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col selection:bg-primary-fixed selection:text-primary">
      {/*  */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 z-50 flex items-center justify-between px-6 lg:px-12">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center p-1">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <path
                d="M50 12L76 22V52C76 68.5 65 81.5 50 86C35 81.5 24 68.5 24 52V22L50 12Z"
                stroke="#3525cd"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7"
                fill="#f2f3ff"
              />
              <path
                d="M38 68L32 74C30 76 27 76 25 74L24 73C22 71 22 68 24 66L30 60"
                stroke="#855300"
                strokeLinecap="round"
                strokeWidth="5"
              />
              <path d="M37 55L69 23L77 31L45 63" fill="#4f46e5" />
              <path d="M69 23L79 17L81 27L77 31L69 23Z" fill="#fea619" />
            </svg>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-on-surface">LIFE RPG</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-on-surface-variant">
          <a href="#how-it-works" className="hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#quests" className="hover:text-primary transition-colors">
            Quest Loop
          </a>
          <a href="#progression" className="hover:text-primary transition-colors">
            Progression
          </a>
          <a href="#attributes" className="hover:text-primary transition-colors">
            Attributes
          </a>
          <a href="#bazaar" className="hover:text-primary transition-colors">
            Bazaar
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <NavLink
            to="/login"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            Enter World
          </NavLink>
          <NavLink
            to="/register"
            className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-sm font-bold hover:bg-primary shadow-sm active:scale-95 transition-all"
          >
            Start Your Journey
          </NavLink>
        </div>
      </header>

      {/*  */}
      <main className="flex-1 pt-16">
        {/*  */}
        <section className="relative px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex flex-col max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold uppercase tracking-wider mb-6 w-fit">
              <span className="material-symbols-outlined text-[16px]">swords</span>
              <span>Next-Gen Executive Productivity Suite</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-[1.1] mb-6">
              YOUR LIFE.
              <br />
              <span className="text-primary-container">YOUR QUEST.</span>
              <br />
              YOUR LEGACY.
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant font-medium leading-relaxed mb-8 max-w-xl">
              Turn everyday actions into quests. Earn XP. Build your character. Maintain your streak.
              Unlock rewards. Level up your life.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <NavLink
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-primary-container text-on-primary font-bold text-base hover:bg-primary shadow-md active:scale-95 transition-all flex items-center gap-2"
              >
                <span>START YOUR JOURNEY</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </NavLink>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-xl bg-surface-container text-on-surface font-semibold text-base hover:bg-surface-container-high transition-colors flex items-center gap-2"
              >
                <span>SEE HOW IT WORKS</span>
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
              </a>
            </div>

            {/*  */}
            <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-outline-variant/40">
              <div>
                <span className="text-2xl font-black text-on-surface tabular-nums">148+</span>
                <p className="text-xs text-outline font-medium">Quests Cleared</p>
              </div>
              <div>
                <span className="text-2xl font-black text-error tabular-nums">27 Days</span>
                <p className="text-xs text-outline font-medium">Active Discipline Streak</p>
              </div>
              <div>
                <span className="text-2xl font-black text-secondary tabular-nums">1,240 G</span>
                <p className="text-xs text-outline font-medium">Gold Bullion Earned</p>
              </div>
            </div>
          </div>

          {/*  */}
          <div className="w-full lg:w-[480px] bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/50 shadow-2xl flex flex-col gap-5 relative">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwjRLyzuY0c2W-43xvEvsBzA8Mn27pW7w3Rxdi1Zmf4l9FYMmcKRkCSZOTv2tj7ZFq8hQzsNAyJKmu22l0TMS4ub4227YG0BVi3fSkan9u3ltS6wezNUaMAZXyWC9pQrpIq3wjaB0fEa9Sy7hwR43uZyiorn53wLHq-Qqe70RoVj3cHpAywTmI1rY2SE2PTX9-DHC8NgAg0qdFfTgEuneXnROT2wr5PHS_nY0B3gczfn84VKbLtpGd"
                  alt="Arion Vance"
                  className="w-12 h-12 rounded-xl object-cover border border-outline-variant/40"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-on-surface">Arion Vance</span>
                    <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2 py-0.5 rounded">
                      LVL 14
                    </span>
                  </div>
                  <span className="text-xs text-outline">Rank S Code Architect</span>
                </div>
              </div>

              <div className="flex items-center gap-2 tabular-nums">
                <span className="px-2 py-1 rounded bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                  1,240 G
                </span>
                <span className="px-2 py-1 rounded bg-error-container text-on-error-container text-xs font-bold">
                  27 🔥
                </span>
              </div>
            </div>

            {/*  */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold tabular-nums">
                <span className="text-outline uppercase text-[10px]">Tier Progression</span>
                <span className="text-primary">8,420 / 10,000 XP (84%)</span>
              </div>
              <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full" style={{ width: '84%' }} />
              </div>
            </div>

            {/*  */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-6 h-6 rounded bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-on-surface truncate">
                    Study DSA: Binary Trees & DP
                  </span>
                  <span className="text-[11px] text-tertiary font-semibold">
                    +100 XP • +15 INT • +25 Gold
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary text-[11px] font-bold shrink-0">
                Completed
              </span>
            </div>

            {/*  */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 flex justify-between items-center">
                <span className="font-bold text-violet-700">Intellect</span>
                <span className="font-extrabold text-violet-900 tabular-nums">91 / 100</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex justify-between items-center">
                <span className="font-bold text-amber-700">Strength</span>
                <span className="font-extrabold text-amber-900 tabular-nums">72 / 100</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                <span className="font-bold text-emerald-700">Discipline</span>
                <span className="font-extrabold text-emerald-900 tabular-nums">84 / 100</span>
              </div>
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 flex justify-between items-center">
                <span className="font-bold text-sky-700">Vitality</span>
                <span className="font-extrabold text-sky-900 tabular-nums">68 / 100</span>
              </div>
            </div>
          </div>
        </section>

        {/*  */}
        <section className="px-6 lg:px-12 py-16 bg-surface-container-low border-y border-outline-variant/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                The Delayed Gratification Crisis
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight mt-1">
                Why Traditional To-Do Lists Fail Your Brain
              </h2>
              <p className="text-sm text-on-surface-variant mt-2">
                Real-life work delivers delayed rewards months later. Video games deliver immediate,
                tangible dopamine. LIFE RPG bridges this chasm with instant telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/*  */}
              <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-outline" />
                    <h3 className="font-bold text-base text-outline uppercase tracking-wider">
                      Traditional Productivity (Boring Checklist)
                    </h3>
                  </div>
                  <div className="space-y-3 font-mono text-sm text-on-surface-variant">
                    <div className="p-3 rounded-lg bg-surface-container flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-outline">
                        check_box_outline_blank
                      </span>
                      <span>Study Data Structures</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-outline">
                        check_box_outline_blank
                      </span>
                      <span>Exercise 45 minutes</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-outline">
                        check_box_outline_blank
                      </span>
                      <span>Read 20 pages</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-outline mt-6 italic">
                  Result: Zero feedback, zero motivation, habit abandoned in 4 days.
                </p>
              </div>

              {/*  */}
              <div className="p-8 rounded-2xl bg-surface-container-lowest border-2 border-primary-container shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-fixed/40 rounded-full blur-2xl" />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-primary-container animate-pulse" />
                    <h3 className="font-bold text-base text-primary-container uppercase tracking-wider">
                      LIFE RPG Immediate Telemetry Loop
                    </h3>
                  </div>

                  <div className="p-5 rounded-xl bg-primary-fixed/20 border border-primary-fixed space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-primary tracking-wide">
                        ⚔ QUEST COMPLETE!
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary text-[10px] font-bold">
                        Level Up Soon
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold tabular-nums">
                      <div className="p-2 rounded bg-surface-container-lowest text-primary flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        <span>+100 XP Earned</span>
                      </div>
                      <div className="p-2 rounded bg-surface-container-lowest text-violet-700 flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                        <span>+15 Intellect</span>
                      </div>
                      <div className="p-2 rounded bg-surface-container-lowest text-secondary flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">monetization_on</span>
                        <span>+25 Gold Coins</span>
                      </div>
                      <div className="p-2 rounded bg-surface-container-lowest text-error flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                        <span>🔥 Streak +1 (Day 28)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-primary font-bold mt-6">
                  Result: Neuro-chemical closure, daily discipline, compounding real-life mastery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/*  */}
        <section id="how-it-works" className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              The 4-Step System Loop
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mt-1">
              How You Play LIFE RPG
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'CREATE A QUEST',
                desc: 'Commission your daily coding, fitness, reading, or career milestones with clear acceptance criteria.',
                icon: 'assignment_add',
              },
              {
                step: '02',
                title: 'COMPLETE IT',
                desc: 'Execute in the real world with focused attention. No distractions, no fake productivity.',
                icon: 'check_circle',
              },
              {
                step: '03',
                title: 'EARN XP + REWARDS',
                desc: 'Claim experience points, attribute upgrades, and in-game gold bullion instantly.',
                icon: 'military_tech',
              },
              {
                step: '04',
                title: 'LEVEL UP',
                desc: 'Ascend character tiers, unlock equipment in the Bazaar, and build an unbreakable streak.',
                icon: 'trending_up',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-card flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-primary/30 font-mono">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/*  */}
        <section id="attributes" className="px-6 lg:px-12 py-20 bg-surface-container-low border-t border-outline-variant/30">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col">
              <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                RPG Progression Mechanics
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mb-6">
                Five Vectors of Human Mastery
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Every quest maps directly to one of your 5 core character attributes. Watch your
                radar polygon expand as you balance deep engineering with physical vitality.
              </p>

              <div className="space-y-3">
                {[
                  { name: 'Strength', icon: 'fitness_center', text: 'Gym workout, running, physical stamina' },
                  { name: 'Intellect', icon: 'psychology', text: 'Algorithms, system design, technical books' },
                  { name: 'Vitality', icon: 'spa', text: 'Restorative sleep, hydration, VO2 recovery' },
                  { name: 'Discipline', icon: 'hourglass_top', text: 'Uninterrupted deep work blocks, meditation' },
                  { name: 'Charisma', icon: 'palette', text: 'Public presentations, design showcases, writing' },
                ].map((attr) => (
                  <div key={attr.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary text-[20px]">{attr.icon}</span>
                    <span className="font-bold text-xs text-on-surface w-24">{attr.name}</span>
                    <span className="text-xs text-outline flex-1">{attr.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/*  */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/40 shadow-xl flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-outline mb-4">
                  Character Telemetry Radar
                </span>
                <svg viewBox="0 0 200 200" className="w-64 h-64 overflow-visible">
                  <polygon points="100,25 171,77 144,160 56,160 29,77" fill="none" stroke="#dae2fd" strokeWidth="1.5" />
                  <polygon points="100,50 148,85 129,140 71,140 52,85" fill="none" stroke="#eaedff" strokeWidth="1" strokeDasharray="3 3" />
                  <polygon points="100,45 164,79 136,150 64,150 54,85" className="fill-primary/25" stroke="#4f46e5" strokeWidth="2.5" />
                  <circle cx="100" cy="45" r="4" fill="#4f46e5" />
                  <circle cx="164" cy="79" r="4" fill="#4f46e5" />
                  <circle cx="136" cy="150" r="4" fill="#4f46e5" />
                  <circle cx="64" cy="150" r="4" fill="#4f46e5" />
                  <circle cx="54" cy="85" r="4" fill="#4f46e5" />
                  <text x="100" y="14" textAnchor="middle" className="text-[10px] font-bold fill-amber-700">STR (72)</text>
                  <text x="185" y="80" textAnchor="start" className="text-[10px] font-bold fill-violet-700">INT (91)</text>
                  <text x="154" y="180" textAnchor="middle" className="text-[10px] font-bold fill-sky-700">VIT (68)</text>
                  <text x="46" y="180" textAnchor="middle" className="text-[10px] font-bold fill-emerald-700">DIS (84)</text>
                  <text x="15" y="80" textAnchor="end" className="text-[10px] font-bold fill-rose-700">CHA (55)</text>
                </svg>
                <div className="w-full mt-6 p-3 rounded-lg bg-surface-container-low text-center text-xs font-bold text-primary">
                  Dominant Synergy: Intellect & Discipline (78%)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  */}
        <section className="px-6 lg:px-12 py-20 bg-primary-container text-on-primary text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <span className="material-symbols-outlined text-[48px] mb-4 text-on-primary-container">
              military_tech
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Begin Your Quest Today
            </h2>
            <p className="text-base sm:text-lg text-on-primary-container mb-8 max-w-xl">
              Stop completing boring tasks. Transform into an adventurer. Level up your life with
              every single checkmark.
            </p>
            <NavLink
              to="/register"
              className="px-8 py-4 rounded-xl bg-surface-container-lowest text-primary font-black text-base hover:bg-surface-bright shadow-2xl active:scale-95 transition-all"
            >
              CREATE YOUR DOSSIER NOW
            </NavLink>
          </div>
        </section>
      </main>

      {/*  */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-8 px-6 lg:px-12 text-center text-xs text-outline">
        <p>© 2025 LIFE RPG. Executive gamified progression engine. System v2.4.</p>
      </footer>
    </div>
  );
};
