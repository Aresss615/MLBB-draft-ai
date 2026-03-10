// ─── Hero Data Types ───

export type Role = 'Tank' | 'Fighter' | 'Assassin' | 'Mage' | 'Marksman' | 'Support';

export type Lane = 'EXP' | 'Jungle' | 'Mid' | 'Gold' | 'Roam';

export type Tier = 'S+' | 'S' | 'A' | 'B' | 'C';

export type DamageType = 'Physical' | 'Magical' | 'Mixed' | 'True';

export type PlaystyleTag =
  | 'Engage' | 'Poke' | 'Burst' | 'Sustain' | 'Peel'
  | 'Splitpush' | 'Teamfight' | 'Pickoff' | 'Dive'
  | 'CC' | 'Zoning' | 'Objective' | 'Snowball'
  | 'Scaling' | 'EarlyGame' | 'Mobility' | 'Utility';

export interface Hero {
  id: string;
  name: string;
  primaryRole: Role;
  secondaryRole?: Role;
  lane: Lane[];
  tier: Tier;
  metaScore: number;       // 1-10
  winRate: number;          // percentage: 45-55
  pickRate: number;         // percentage: 1-30
  banRate: number;          // percentage: 0-80
  difficulty: number;       // 1-10
  playstyleTags: PlaystyleTag[];
  strengths: string[];
  weaknesses: string[];
  counters: string[];       // hero ids this hero counters
  synergies: string[];      // hero ids this hero synergizes with
  damageType: DamageType;
  engageScore: number;      // 1-10
  peelScore: number;        // 1-10
  sustainScore: number;     // 1-10
  burstScore: number;       // 1-10
  scalingScore: number;     // 1-10
  shortDescription: string;
}

// ─── Draft Types ───

export type Side = 'ally' | 'enemy';

export interface DraftSlot {
  heroId: string | null;
  role?: Lane;
}

export interface DraftState {
  allyPicks: DraftSlot[];
  enemyPicks: DraftSlot[];
  allyBans: (string | null)[];
  enemyBans: (string | null)[];
}

export interface SelectionTarget {
  side: Side;
  type: 'pick' | 'ban';
  index: number;
}

// ─── Recommendation Types ───

export type BadgeType =
  | 'Strong Counter'
  | 'Good Synergy'
  | 'Safe Pick'
  | 'High Risk'
  | 'Comfort Pick'
  | 'Meta Priority'
  | 'Role Fill'
  | 'Damage Balance';

export interface Recommendation {
  heroId: string;
  totalScore: number;
  role: Role;
  reason: string;
  badges: BadgeType[];
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  metaStrength: number;
  counterValue: number;
  synergyValue: number;
  roleNeed: number;
  damageBalance: number;
  safety: number;
  riskPenalty: number;
  preferenceBonus: number;
}

export interface BanRecommendation {
  heroId: string;
  totalScore: number;
  role: Role;
  reason: string;
  badges: BadgeType[];
}

// ─── Composition Analysis Types ───

export type CompWarning =
  | 'Lacks frontline'
  | 'Lacks engage'
  | 'Lacks crowd control'
  | 'Too squishy'
  | 'Too much physical damage'
  | 'Too much magic damage'
  | 'Weak early game'
  | 'Weak late game'
  | 'Weak peel'
  | 'Low backline safety'
  | 'Balanced comp'
  | 'No sustained damage'
  | 'Lacks burst damage';

export type CompStyle =
  | 'Dive Comp'
  | 'Poke Comp'
  | 'Burst Comp'
  | 'Sustain Comp'
  | 'Scaling Comp'
  | 'Pickoff Comp'
  | 'Teamfight Comp'
  | 'Split Push Comp';

export interface CompAnalysis {
  warnings: CompWarning[];
  strengths: string[];
  styleClassification: CompStyle[];
  styleExplanation: string;
}

// ─── Preferences Types ───

export interface UserPreferences {
  preferredRole: Role | 'Fill';
  comfortHeroes: string[];
  excludedHeroes: string[];
  mode: 'solo' | 'team';
}

// ─── Coach / AI Types ───

export interface CoachNote {
  teamMissing: string;
  enemyStrategy: string;
  pickLogic: string;
  heroesToAvoid: string;
}

export interface AIAdapterConfig {
  mode: 'local' | 'cloud' | 'ollama';
  endpoint?: string;
  apiKey?: string;
  model?: string;
}
