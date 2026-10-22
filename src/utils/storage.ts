import { StampRecord, ExplorerRank } from '../types';

const STORAGE_KEY = 'taiwan_travel_stamps_v1';

export function getStoredStamps(): Record<string, StampRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stamps from storage:', err);
    return {};
  }
}

export function saveStamp(spotId: string): StampRecord {
  const currentStamps = getStoredStamps();
  const now = new Date();
  
  // Format date in traditional Taiwan format (e.g. 2026.10.21 16:30)
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedDate = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  
  const record: StampRecord = {
    spotId,
    stampedAt: now.toISOString(),
    formattedDate,
    stampNumber: `TW-STAMP-${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  currentStamps[spotId] = record;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStamps));
  } catch (err) {
    console.error('Failed to save stamp to localStorage:', err);
  }

  return record;
}

export function removeStamp(spotId: string): void {
  const currentStamps = getStoredStamps();
  if (currentStamps[spotId]) {
    delete currentStamps[spotId];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStamps));
    } catch (err) {
      console.error('Failed to delete stamp from localStorage:', err);
    }
  }
}

export function clearAllStamps(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear stamps:', err);
  }
}

export const RANKS: ExplorerRank[] = [
  {
    title: '台灣初探者',
    subtitle: 'Taiwan Novice Explorer',
    min: 0,
    max: 10,
    badgeColor: 'border-slate-300 text-slate-700 bg-slate-50',
    nextThreshold: 11,
  },
  {
    title: '行腳旅人',
    subtitle: 'Island Wayfarer',
    min: 11,
    max: 30,
    badgeColor: 'border-emerald-300 text-emerald-800 bg-emerald-50',
    nextThreshold: 31,
  },
  {
    title: '寶島達人',
    subtitle: 'Formosa Connoisseur',
    min: 31,
    max: 60,
    badgeColor: 'border-cyan-300 text-cyan-800 bg-cyan-50',
    nextThreshold: 61,
  },
  {
    title: '山海巡歷者',
    subtitle: 'Highland & Ocean Ranger',
    min: 61,
    max: 90,
    badgeColor: 'border-amber-300 text-amber-900 bg-amber-50',
    nextThreshold: 91,
  },
  {
    title: '福爾摩沙巡禮宗師',
    subtitle: 'Master of Formosa Pilgrimage',
    min: 91,
    max: 100,
    badgeColor: 'border-rose-300 text-rose-900 bg-rose-50',
    nextThreshold: 100,
  },
];

export function getExplorerRank(count: number): ExplorerRank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (count >= RANKS[i].min) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}
