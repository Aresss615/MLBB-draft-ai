import type {
  Hero,
  DraftState,
  Recommendation,
  BanRecommendation,
  ScoreBreakdown,
  BadgeType,
  UserPreferences,
  Role,
} from '../types';
import { heroes, getHeroById, getAllUsedIds } from '../data/heroes';

// ─── Scoring Weights (easy to tweak) ───

const PICK_WEIGHTS = {
  metaStrength: 0.20,
  counterValue: 0.22,
  synergyValue: 0.18,
  roleNeed: 0.15,
  damageBalance: 0.08,
  safety: 0.07,
  preferenceBonus: 0.10,
};

const BAN_WEIGHTS = {
  metaThreat: 0.30,
  dangerToTeam: 0.30,
  hardToAnswer: 0.20,
  snowballDanger: 0.10,
  generalPriority: 0.10,
};

// ─── Tier Values ───

function tierValue(tier: string): number {
  switch (tier) {
    case 'S+': return 10;
    case 'S': return 8.5;
    case 'A': return 7;
    case 'B': return 5.5;
    case 'C': return 4;
    default: return 5;
  }
}

// ─── Get current ally/enemy heroes ───

function getAllyHeroes(draft: DraftState): Hero[] {
  return draft.allyPicks
    .map(s => s.heroId ? getHeroById(s.heroId) : undefined)
    .filter((h): h is Hero => !!h);
}

function getEnemyHeroes(draft: DraftState): Hero[] {
  return draft.enemyPicks
    .map(s => s.heroId ? getHeroById(s.heroId) : undefined)
    .filter((h): h is Hero => !!h);
}

// ─── Role Need Analysis ───

function getRoleNeedMap(allyHeroes: Hero[]): Record<Role, number> {
  const roleCounts: Record<Role, number> = {
    Tank: 0, Fighter: 0, Assassin: 0, Mage: 0, Marksman: 0, Support: 0,
  };

  allyHeroes.forEach(h => {
    roleCounts[h.primaryRole]++;
    if (h.secondaryRole) roleCounts[h.secondaryRole] += 0.5;
  });

  const totalPicks = allyHeroes.length;
  const ideal: Record<Role, number> = {
    Tank: 1, Fighter: 1, Assassin: 0.5, Mage: 1, Marksman: 1, Support: 0.5,
  };

  const need: Record<Role, number> = {
    Tank: 0, Fighter: 0, Assassin: 0, Mage: 0, Marksman: 0, Support: 0,
  };

  if (totalPicks === 0) {
    // All roles equally needed
    Object.keys(need).forEach(r => { need[r as Role] = 5; });
    return need;
  }

  for (const role of Object.keys(ideal) as Role[]) {
    const deficit = ideal[role] - roleCounts[role];
    need[role] = Math.max(0, deficit * 8);
    // Extra urgency if we have 3+ picks and still no tank
    if (role === 'Tank' && roleCounts.Tank === 0 && totalPicks >= 3) {
      need[role] += 3;
    }
    // Extra urgency for no marksman after 3 picks
    if (role === 'Marksman' && roleCounts.Marksman === 0 && totalPicks >= 3) {
      need[role] += 2;
    }
  }

  return need;
}

// ─── Damage Balance Check ───

function getDamageBalance(allyHeroes: Hero[]): { physical: number; magical: number } {
  let physical = 0;
  let magical = 0;

  allyHeroes.forEach(h => {
    if (h.damageType === 'Physical') physical++;
    else if (h.damageType === 'Magical') magical++;
    else if (h.damageType === 'Mixed') { physical += 0.5; magical += 0.5; }
  });

  return { physical, magical };
}

// ─── Pick Scoring ───

function scorePickCandidate(
  hero: Hero,
  draft: DraftState,
  allyHeroes: Hero[],
  enemyHeroes: Hero[],
  roleNeeds: Record<Role, number>,
  dmgBalance: { physical: number; magical: number },
  prefs: UserPreferences,
): { score: number; breakdown: ScoreBreakdown; badges: BadgeType[]; reason: string } {

  const badges: BadgeType[] = [];
  const reasons: string[] = [];

  // 1. Meta Strength
  const meta = (tierValue(hero.tier) * 0.4 + hero.metaScore * 0.35 + (hero.winRate - 48) * 0.25);
  const metaStrength = Math.min(10, Math.max(0, meta));
  if (hero.tier === 'S+' || hero.tier === 'S') {
    badges.push('Meta Priority');
  }

  // 2. Counter Value
  let counterValue = 0;
  if (enemyHeroes.length > 0) {
    let hits = 0;
    enemyHeroes.forEach(enemy => {
      if (hero.counters.includes(enemy.id)) {
        hits++;
      }
    });
    counterValue = (hits / enemyHeroes.length) * 10;
    if (hits > 0) {
      badges.push('Strong Counter');
      const countered = enemyHeroes.filter(e => hero.counters.includes(e.id)).map(e => e.name);
      reasons.push(`Counters ${countered.join(', ')}`);
    }
  }

  // 3. Synergy Value
  let synergyValue = 0;
  if (allyHeroes.length > 0) {
    let synergyHits = 0;
    allyHeroes.forEach(ally => {
      if (hero.synergies.includes(ally.id)) synergyHits++;
      if (ally.synergies.includes(hero.id)) synergyHits++;
    });
    synergyValue = Math.min(10, (synergyHits / allyHeroes.length) * 6);
    if (synergyHits > 0) {
      badges.push('Good Synergy');
      const synWith = allyHeroes.filter(a =>
        hero.synergies.includes(a.id) || a.synergies.includes(hero.id)
      ).map(a => a.name);
      reasons.push(`Synergizes with ${synWith.join(', ')}`);
    }
  }

  // 4. Role Need
  const roleNeed = roleNeeds[hero.primaryRole] +
    (hero.secondaryRole ? roleNeeds[hero.secondaryRole] * 0.4 : 0);
  if (roleNeed >= 6) {
    badges.push('Role Fill');
    reasons.push(`Fills needed ${hero.primaryRole} role`);
  }

  // 5. Damage Balance
  let damageBalance = 0;
  const total = dmgBalance.physical + dmgBalance.magical;
  if (total > 0) {
    const physRatio = dmgBalance.physical / total;
    if (physRatio > 0.65 && (hero.damageType === 'Magical' || hero.damageType === 'Mixed')) {
      damageBalance = 6;
      badges.push('Damage Balance');
      reasons.push('Balances team damage type');
    } else if (physRatio < 0.35 && (hero.damageType === 'Physical' || hero.damageType === 'Mixed')) {
      damageBalance = 6;
      badges.push('Damage Balance');
      reasons.push('Balances team damage type');
    }
  }

  // 6. Safety (good for blind picks)
  const safety = Math.max(0, 10 - hero.difficulty) * 0.5 +
    Math.max(0, 5 - hero.counters.length) * 0.5 +
    (hero.winRate > 51 ? 2 : 0);
  if (safety >= 6 && hero.difficulty <= 5) {
    badges.push('Safe Pick');
  }

  // 7. Risk Penalty
  let riskPenalty = 0;
  if (enemyHeroes.length > 0) {
    enemyHeroes.forEach(enemy => {
      if (enemy.counters.includes(hero.id)) {
        riskPenalty += 3;
      }
    });
    if (riskPenalty > 0) {
      badges.push('High Risk');
    }
  }
  if (hero.difficulty >= 8) {
    riskPenalty += 1.5;
  }

  // 8. Preference Bonus
  let preferenceBonus = 0;
  if (prefs.comfortHeroes.includes(hero.id)) {
    preferenceBonus += 5;
    badges.push('Comfort Pick');
    reasons.push('In your comfort hero pool');
  }
  if (prefs.preferredRole !== 'Fill' && hero.primaryRole === prefs.preferredRole) {
    preferenceBonus += 2;
  }
  if (prefs.mode === 'solo') {
    // Solo queue: favor safer, self-sufficient picks
    if (hero.difficulty <= 5 && hero.sustainScore >= 5) preferenceBonus += 1.5;
  }

  // Final Score
  const breakdown: ScoreBreakdown = {
    metaStrength,
    counterValue,
    synergyValue,
    roleNeed: Math.min(10, roleNeed),
    damageBalance,
    safety: Math.min(10, safety),
    riskPenalty: Math.min(10, riskPenalty),
    preferenceBonus: Math.min(10, preferenceBonus),
  };

  const totalScore =
    breakdown.metaStrength * PICK_WEIGHTS.metaStrength +
    breakdown.counterValue * PICK_WEIGHTS.counterValue +
    breakdown.synergyValue * PICK_WEIGHTS.synergyValue +
    breakdown.roleNeed * PICK_WEIGHTS.roleNeed +
    breakdown.damageBalance * PICK_WEIGHTS.damageBalance +
    breakdown.safety * PICK_WEIGHTS.safety +
    breakdown.preferenceBonus * PICK_WEIGHTS.preferenceBonus -
    breakdown.riskPenalty * 0.15;

  const reason = reasons.length > 0
    ? reasons.slice(0, 2).join('. ')
    : `Strong ${hero.primaryRole} — ${hero.tier} tier meta pick`;

  return { score: Math.max(0, totalScore), breakdown, badges, reason };
}

// ─── Ban Scoring ───

function scoreBanCandidate(
  hero: Hero,
  draft: DraftState,
  allyHeroes: Hero[],
  _enemyHeroes: Hero[],
): { score: number; reason: string; badges: BadgeType[] } {

  const badges: BadgeType[] = [];
  const reasons: string[] = [];

  // 1. Meta Threat
  const metaThreat = tierValue(hero.tier) * 0.4 + hero.metaScore * 0.3 + hero.banRate / 10 * 0.3;

  // 2. Danger to our team
  let dangerToTeam = 0;
  if (allyHeroes.length > 0) {
    allyHeroes.forEach(ally => {
      if (hero.counters.includes(ally.id)) {
        dangerToTeam += 4;
        reasons.push(`Counters our ${ally.name}`);
      }
    });
    dangerToTeam = Math.min(10, dangerToTeam);
  }

  // 3. Hard to Answer
  let hardToAnswer = 0;
  const canCounter = allyHeroes.some(ally => ally.counters.includes(hero.id));
  if (!canCounter && allyHeroes.length > 0) {
    hardToAnswer = 5;
    if (hero.tier === 'S+' || hero.tier === 'S') hardToAnswer += 2;
  }

  // 4. Snowball Danger
  let snowballDanger = 0;
  if (hero.playstyleTags.includes('Snowball')) snowballDanger += 3;
  if (hero.playstyleTags.includes('EarlyGame')) snowballDanger += 2;
  if (hero.primaryRole === 'Assassin') snowballDanger += 2;

  // 5. General Priority
  const generalPriority = hero.banRate / 10 + tierValue(hero.tier) * 0.3;

  const totalScore =
    metaThreat * BAN_WEIGHTS.metaThreat +
    dangerToTeam * BAN_WEIGHTS.dangerToTeam +
    hardToAnswer * BAN_WEIGHTS.hardToAnswer +
    snowballDanger * BAN_WEIGHTS.snowballDanger +
    generalPriority * BAN_WEIGHTS.generalPriority;

  if (dangerToTeam > 3) badges.push('Strong Counter');
  if (hero.tier === 'S+' || hero.tier === 'S') badges.push('Meta Priority');
  if (snowballDanger >= 5) badges.push('High Risk');

  const reason = reasons.length > 0
    ? reasons.slice(0, 2).join('. ')
    : `High meta threat — ${hero.tier} tier, ${hero.banRate}% ban rate`;

  return { score: Math.max(0, totalScore), reason, badges };
}

// ─── Main Recommendation Functions ───

export function getPickRecommendations(
  draft: DraftState,
  prefs: UserPreferences,
  count: number = 5,
): Recommendation[] {
  const usedIds = getAllUsedIds(draft);
  const allyHeroes = getAllyHeroes(draft);
  const enemyHeroes = getEnemyHeroes(draft);
  const roleNeeds = getRoleNeedMap(allyHeroes);
  const dmgBalance = getDamageBalance(allyHeroes);

  const candidates = heroes
    .filter(h => !usedIds.has(h.id))
    .filter(h => !prefs.excludedHeroes.includes(h.id));

  const scored = candidates.map(hero => {
    const result = scorePickCandidate(hero, draft, allyHeroes, enemyHeroes, roleNeeds, dmgBalance, prefs);
    return {
      heroId: hero.id,
      totalScore: result.score,
      role: hero.primaryRole,
      reason: result.reason,
      badges: result.badges,
      breakdown: result.breakdown,
    } as Recommendation;
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored.slice(0, count);
}

export function getBanRecommendations(
  draft: DraftState,
  _prefs: UserPreferences,
  count: number = 5,
): BanRecommendation[] {
  const usedIds = getAllUsedIds(draft);
  const allyHeroes = getAllyHeroes(draft);
  const enemyHeroes = getEnemyHeroes(draft);

  const candidates = heroes.filter(h => !usedIds.has(h.id));

  const scored = candidates.map(hero => {
    const result = scoreBanCandidate(hero, draft, allyHeroes, enemyHeroes);
    return {
      heroId: hero.id,
      totalScore: result.score,
      role: hero.primaryRole,
      reason: result.reason,
      badges: result.badges,
    } as BanRecommendation;
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored.slice(0, count);
}
