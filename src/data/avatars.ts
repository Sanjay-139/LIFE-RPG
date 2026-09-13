import av01 from '../assets/avatars/avatar-01.svg';
import av02 from '../assets/avatars/avatar-02.svg';
import av03 from '../assets/avatars/avatar-03.svg';
import av04 from '../assets/avatars/avatar-04.svg';
import av05 from '../assets/avatars/avatar-05.svg';
import av06 from '../assets/avatars/avatar-06.svg';
import av07 from '../assets/avatars/avatar-07.svg';
import av08 from '../assets/avatars/avatar-08.svg';
import av09 from '../assets/avatars/avatar-09.svg';
import av10 from '../assets/avatars/avatar-10.svg';
import av11 from '../assets/avatars/avatar-11.svg';
import av12 from '../assets/avatars/avatar-12.svg';
import av13 from '../assets/avatars/avatar-13.svg';
import av14 from '../assets/avatars/avatar-14.svg';
import av15 from '../assets/avatars/avatar-15.svg';
import av16 from '../assets/avatars/avatar-16.svg';
import av17 from '../assets/avatars/avatar-17.svg';
import av18 from '../assets/avatars/avatar-18.svg';
import av19 from '../assets/avatars/avatar-19.svg';
import av20 from '../assets/avatars/avatar-20.svg';
import av21 from '../assets/avatars/avatar-21.svg';
import av22 from '../assets/avatars/avatar-22.svg';
import av23 from '../assets/avatars/avatar-23.svg';
import av24 from '../assets/avatars/avatar-24.svg';

export interface AvatarOption {
  id: string;
  name: string;
  archetype: 'Warrior' | 'Mage' | 'Rogue' | 'Cyber' | 'Paladin' | 'Scholar' | 'Artificer';
  gender: 'male' | 'female' | 'neutral';
  assetUrl: string;
  accentColor: string;
  description: string;
}

export const AVATAR_REGISTRY: AvatarOption[] = [
  {
    id: 'avatar-01',
    name: 'Iron Vanguard',
    archetype: 'Warrior',
    gender: 'male',
    assetUrl: av01,
    accentColor: '#38bdf8',
    description: 'Disciplined defender forged in heavy steel with glowing cyan optics.'
  },
  {
    id: 'avatar-02',
    name: 'Arcane Sage',
    archetype: 'Mage',
    gender: 'female',
    assetUrl: av02,
    accentColor: '#c084fc',
    description: 'Master of mystical theorems, deep work, and conceptual breakthroughs.'
  },
  {
    id: 'avatar-03',
    name: 'Shadow Rogue',
    archetype: 'Rogue',
    gender: 'neutral',
    assetUrl: av03,
    accentColor: '#2dd4bf',
    description: 'Stealth operator executing daily habits from behind an obsidian veil.'
  },
  {
    id: 'avatar-04',
    name: 'Solar Valkyrie',
    archetype: 'Paladin',
    gender: 'female',
    assetUrl: av04,
    accentColor: '#f59e0b',
    description: 'Radiant champion of morning routines and high-velocity physical training.'
  },
  {
    id: 'avatar-05',
    name: 'Cyber Monk',
    archetype: 'Cyber',
    gender: 'male',
    assetUrl: av05,
    accentColor: '#06b6d4',
    description: 'Digital ascetic blending meditative silence with neural hyperfocus.'
  },
  {
    id: 'avatar-06',
    name: 'Forest Ranger',
    archetype: 'Rogue',
    gender: 'female',
    assetUrl: av06,
    accentColor: '#10b981',
    description: 'Nature-attuned archer navigating long-term stamina and outdoor conditioning.'
  },
  {
    id: 'avatar-07',
    name: 'Storm Caller',
    archetype: 'Mage',
    gender: 'male',
    assetUrl: av07,
    accentColor: '#60a5fa',
    description: 'Harnesses raw electrical intensity for intense sprint intervals and bursts.'
  },
  {
    id: 'avatar-08',
    name: 'Chrono Scholar',
    archetype: 'Scholar',
    gender: 'female',
    assetUrl: av08,
    accentColor: '#fbbf24',
    description: 'Time-management virtuoso tracking hourly velocity and deep study cadence.'
  },
  {
    id: 'avatar-09',
    name: 'Crimson Blade',
    archetype: 'Warrior',
    gender: 'male',
    assetUrl: av09,
    accentColor: '#ef4444',
    description: 'Unyielding berserker crushing difficult tasks through pure grit.'
  },
  {
    id: 'avatar-10',
    name: 'Void Alchemist',
    archetype: 'Mage',
    gender: 'female',
    assetUrl: av10,
    accentColor: '#a855f7',
    description: 'Transmutes chaos and friction into distilled mental clarity.'
  },
  {
    id: 'avatar-11',
    name: 'Titan Guardian',
    archetype: 'Warrior',
    gender: 'male',
    assetUrl: av11,
    accentColor: '#f97316',
    description: 'Immovable fortress of habit resilience that never breaks under pressure.'
  },
  {
    id: 'avatar-12',
    name: 'Wind Strider',
    archetype: 'Rogue',
    gender: 'female',
    assetUrl: av12,
    accentColor: '#38bdf8',
    description: 'Swift scout crossing daily goals with effortless agility and poise.'
  },
  {
    id: 'avatar-13',
    name: 'Neon Netrunner',
    archetype: 'Cyber',
    gender: 'male',
    assetUrl: av13,
    accentColor: '#22c55e',
    description: 'Hacker deconstructing complex problems into executable micro-tasks.'
  },
  {
    id: 'avatar-14',
    name: 'Dawn Priestess',
    archetype: 'Paladin',
    gender: 'female',
    assetUrl: av14,
    accentColor: '#facc15',
    description: 'Beacon of restorative sleep, wholesome nutrition, and calm willpower.'
  },
  {
    id: 'avatar-15',
    name: 'Dragon Knight',
    archetype: 'Warrior',
    gender: 'male',
    assetUrl: av15,
    accentColor: '#f97316',
    description: 'Fiery combatant conquering epic life milestones and difficult tests.'
  },
  {
    id: 'avatar-16',
    name: 'Night Huntress',
    archetype: 'Rogue',
    gender: 'female',
    assetUrl: av16,
    accentColor: '#818cf8',
    description: 'Focused specialist targeting high-leverage outcomes without distraction.'
  },
  {
    id: 'avatar-17',
    name: 'Frost Wanderer',
    archetype: 'Scholar',
    gender: 'male',
    assetUrl: av17,
    accentColor: '#38bdf8',
    description: 'Stoic thinker maintaining frozen composure during extreme workload.'
  },
  {
    id: 'avatar-18',
    name: 'Flame Weaver',
    archetype: 'Mage',
    gender: 'female',
    assetUrl: av18,
    accentColor: '#ea580c',
    description: 'Ignites burning motivation and passion for daily creative output.'
  },
  {
    id: 'avatar-19',
    name: 'Iron Mechanic',
    archetype: 'Artificer',
    gender: 'male',
    assetUrl: av19,
    accentColor: '#38bdf8',
    description: 'Engineering mind building automated workflows and reproducible habits.'
  },
  {
    id: 'avatar-20',
    name: 'Celestial Oracle',
    archetype: 'Mage',
    gender: 'female',
    assetUrl: av20,
    accentColor: '#a78bfa',
    description: 'Visionary architect charting multi-year trajectories and long horizons.'
  },
  {
    id: 'avatar-21',
    name: 'Rune Knight',
    archetype: 'Paladin',
    gender: 'male',
    assetUrl: av21,
    accentColor: '#38bdf8',
    description: 'Inscribes permanent discipline into daily code, study, and strength routines.'
  },
  {
    id: 'avatar-22',
    name: 'Blade Dancer',
    archetype: 'Warrior',
    gender: 'female',
    assetUrl: av22,
    accentColor: '#f472b6',
    description: 'Executes rapid-fire productivity with razor precision and fluid rhythm.'
  },
  {
    id: 'avatar-23',
    name: 'Shadow Warden',
    archetype: 'Cyber',
    gender: 'neutral',
    assetUrl: av23,
    accentColor: '#14b8a6',
    description: 'Spectral sentinel guarding your streak against procrastination demons.'
  },
  {
    id: 'avatar-24',
    name: 'Astral Empress',
    archetype: 'Scholar',
    gender: 'female',
    assetUrl: av24,
    accentColor: '#e879f9',
    description: 'Supreme orchestrator transforming daily execution into legendary destiny.'
  }
];

export function getAvatarOption(idOrUrl?: string): AvatarOption {
  if (!idOrUrl) return AVATAR_REGISTRY[0];

  const foundById = AVATAR_REGISTRY.find(a => a.id === idOrUrl);
  if (foundById) return foundById;

  const foundByUrl = AVATAR_REGISTRY.find(a => a.assetUrl === idOrUrl);
  if (foundByUrl) return foundByUrl;

  return AVATAR_REGISTRY[0];
}

export function getAvatarAsset(idOrUrl?: string): string {
  if (!idOrUrl) return AVATAR_REGISTRY[0].assetUrl;

  // Check if it matches a known avatar-id
  const match = AVATAR_REGISTRY.find(a => a.id === idOrUrl);
  if (match) return match.assetUrl;

  // If it's an imported asset URL or base64 data URI, use it directly
  if (idOrUrl.startsWith('data:') || idOrUrl.startsWith('/assets/') || idOrUrl.startsWith('http')) {
    // If it's a legacy external dicebear URL, map gracefully to avatar-01
    if (idOrUrl.includes('dicebear.com') || idOrUrl.includes('lh3.googleusercontent.com')) {
      return AVATAR_REGISTRY[0].assetUrl;
    }
    return idOrUrl;
  }

  return AVATAR_REGISTRY[0].assetUrl;
}
