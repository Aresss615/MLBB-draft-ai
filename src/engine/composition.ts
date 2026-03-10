import type { Hero, DraftState, CompWarning, CompStyle, CompAnalysis } from '../types';
import { getHeroById } from '../data/heroes';

// ─── Helper: Get heroes from draft slots ───

function getHeroes(slots: { heroId: string | null }[]): Hero[] {
  return slots
    .map(s => s.heroId ? getHeroById(s.heroId) : undefined)
    .filter((h): h is Hero => !!h);
}

// ─── Ally Composition Warnings ───

export function analyzeAllyComp(draft: DraftState): { warnings: CompWarning[]; strengths: string[] } {
  const allyHeroes = getHeroes(draft.allyPicks);

  if (allyHeroes.length === 0) {
    return { warnings: [], strengths: [] };
  }

  const warnings: CompWarning[] = [];
  const strengths: string[] = [];

  // Frontline check
  const hasTank = allyHeroes.some(h => h.primaryRole === 'Tank' || h.secondaryRole === 'Tank');
  const hasFighter = allyHeroes.some(h => h.primaryRole === 'Fighter');
  if (!hasTank && !hasFighter && allyHeroes.length >= 2) {
    warnings.push('Lacks frontline');
  }
  if (!hasTank && allyHeroes.length >= 3) {
    warnings.push('Too squishy');
  }

  // Engage check
  const totalEngage = allyHeroes.reduce((sum, h) => sum + h.engageScore, 0) / allyHeroes.length;
  if (totalEngage < 4 && allyHeroes.length >= 3) {
    warnings.push('Lacks engage');
  }
  if (totalEngage >= 7) {
    strengths.push('Strong initiation tools');
  }

  // CC check
  const hasCCHeroes = allyHeroes.filter(h => h.playstyleTags.includes('CC'));
  if (hasCCHeroes.length === 0 && allyHeroes.length >= 2) {
    warnings.push('Lacks crowd control');
  }
  if (hasCCHeroes.length >= 3) {
    strengths.push('Heavy crowd control chain');
  }

  // Damage type balance
  let physicalCount = 0;
  let magicalCount = 0;
  allyHeroes.forEach(h => {
    if (h.damageType === 'Physical') physicalCount++;
    else if (h.damageType === 'Magical') magicalCount++;
    else if (h.damageType === 'Mixed') { physicalCount += 0.5; magicalCount += 0.5; }
  });
  const total = physicalCount + magicalCount;
  if (total > 0) {
    if (physicalCount / total > 0.75) {
      warnings.push('Too much physical damage');
    }
    if (magicalCount / total > 0.75) {
      warnings.push('Too much magic damage');
    }
  }
  if (total > 0 && Math.abs(physicalCount - magicalCount) / total < 0.2) {
    strengths.push('Well-balanced damage types');
  }

  // Scaling check
  const avgScaling = allyHeroes.reduce((sum, h) => sum + h.scalingScore, 0) / allyHeroes.length;
  if (avgScaling < 4.5 && allyHeroes.length >= 3) {
    warnings.push('Weak late game');
  }
  if (avgScaling >= 7) {
    strengths.push('Strong late game scaling');
  }

  // Early game check
  const earlyHeroes = allyHeroes.filter(h => h.playstyleTags.includes('EarlyGame') || h.playstyleTags.includes('Snowball'));
  if (earlyHeroes.length === 0 && allyHeroes.length >= 3) {
    warnings.push('Weak early game');
  }
  if (earlyHeroes.length >= 3) {
    strengths.push('Strong early game pressure');
  }

  // Peel check
  const avgPeel = allyHeroes.reduce((sum, h) => sum + h.peelScore, 0) / allyHeroes.length;
  if (avgPeel < 3.5 && allyHeroes.length >= 3) {
    warnings.push('Weak peel');
  }
  if (avgPeel >= 6) {
    strengths.push('Good peeling for backline');
  }

  // Backline safety
  const squishyCarries = allyHeroes.filter(h =>
    (h.primaryRole === 'Marksman' || h.primaryRole === 'Mage') && h.peelScore <= 3
  );
  const peelers = allyHeroes.filter(h => h.peelScore >= 6);
  if (squishyCarries.length >= 2 && peelers.length === 0 && allyHeroes.length >= 3) {
    warnings.push('Low backline safety');
  }

  // Sustain check
  const avgSustain = allyHeroes.reduce((sum, h) => sum + h.sustainScore, 0) / allyHeroes.length;
  if (avgSustain >= 6) {
    strengths.push('High team sustain');
  }

  // Burst check
  const avgBurst = allyHeroes.reduce((sum, h) => sum + h.burstScore, 0) / allyHeroes.length;
  if (avgBurst < 4 && allyHeroes.length >= 3) {
    warnings.push('Lacks burst damage');
  }
  if (avgBurst >= 7) {
    strengths.push('High burst potential');
  }

  // No sustained damage
  const hasSustainedDmg = allyHeroes.some(h =>
    h.primaryRole === 'Marksman' || h.playstyleTags.includes('Sustain')
  );
  if (!hasSustainedDmg && allyHeroes.length >= 3) {
    warnings.push('No sustained damage');
  }

  // Balanced comp check
  if (warnings.length === 0 && allyHeroes.length >= 3) {
    warnings.push('Balanced comp');
  }

  return { warnings, strengths };
}

// ─── Enemy Composition Style Classification ───

export function analyzeEnemyComp(draft: DraftState): CompAnalysis {
  const enemyHeroes = getHeroes(draft.enemyPicks);

  if (enemyHeroes.length === 0) {
    return {
      warnings: [],
      strengths: [],
      styleClassification: [],
      styleExplanation: 'Enemy has not picked any heroes yet.',
    };
  }

  const styles: { style: CompStyle; score: number; reasons: string[] }[] = [];

  // Dive Comp
  {
    let score = 0;
    const reasons: string[] = [];
    const divers = enemyHeroes.filter(h => h.playstyleTags.includes('Dive'));
    score += divers.length * 3;
    if (divers.length > 0) reasons.push(`${divers.map(h => h.name).join(', ')} are dive threats`);
    const assassins = enemyHeroes.filter(h => h.primaryRole === 'Assassin');
    score += assassins.length * 2;
    if (assassins.length > 0) reasons.push(`${assassins.length} assassin(s) to pressure backline`);
    const avgEngage = enemyHeroes.reduce((s, h) => s + h.engageScore, 0) / enemyHeroes.length;
    if (avgEngage >= 6) { score += 2; reasons.push('High team engage potential'); }
    styles.push({ style: 'Dive Comp', score, reasons });
  }

  // Poke Comp
  {
    let score = 0;
    const reasons: string[] = [];
    const pokers = enemyHeroes.filter(h => h.playstyleTags.includes('Poke'));
    score += pokers.length * 3;
    if (pokers.length > 0) reasons.push(`${pokers.map(h => h.name).join(', ')} bring strong poke`);
    const zoningHeroes = enemyHeroes.filter(h => h.playstyleTags.includes('Zoning'));
    score += zoningHeroes.length * 2;
    if (zoningHeroes.length > 0) reasons.push('Zoning heroes control space');
    styles.push({ style: 'Poke Comp', score, reasons });
  }

  // Burst Comp
  {
    let score = 0;
    const reasons: string[] = [];
    const avgBurst = enemyHeroes.reduce((s, h) => s + h.burstScore, 0) / enemyHeroes.length;
    if (avgBurst >= 7) { score += 4; reasons.push('Very high average burst damage'); }
    else if (avgBurst >= 5.5) { score += 2; reasons.push('Moderate burst potential'); }
    const bursty = enemyHeroes.filter(h => h.burstScore >= 8);
    score += bursty.length * 2;
    if (bursty.length > 0) reasons.push(`${bursty.map(h => h.name).join(', ')} have high burst`);
    styles.push({ style: 'Burst Comp', score, reasons });
  }

  // Sustain Comp
  {
    let score = 0;
    const reasons: string[] = [];
    const avgSustain = enemyHeroes.reduce((s, h) => s + h.sustainScore, 0) / enemyHeroes.length;
    if (avgSustain >= 6) { score += 4; reasons.push('High team sustain'); }
    const sustainHeroes = enemyHeroes.filter(h => h.playstyleTags.includes('Sustain'));
    score += sustainHeroes.length * 2;
    if (sustainHeroes.length > 0) reasons.push(`${sustainHeroes.map(h => h.name).join(', ')} bring sustain`);
    styles.push({ style: 'Sustain Comp', score, reasons });
  }

  // Scaling Comp
  {
    let score = 0;
    const reasons: string[] = [];
    const avgScaling = enemyHeroes.reduce((s, h) => s + h.scalingScore, 0) / enemyHeroes.length;
    if (avgScaling >= 7) { score += 4; reasons.push('Very high scaling potential'); }
    else if (avgScaling >= 5.5) { score += 2; reasons.push('Moderate scaling'); }
    const scalers = enemyHeroes.filter(h => h.playstyleTags.includes('Scaling') || h.scalingScore >= 8);
    score += scalers.length * 2;
    if (scalers.length > 0) reasons.push(`${scalers.map(h => h.name).join(', ')} scale hard`);
    styles.push({ style: 'Scaling Comp', score, reasons });
  }

  // Pickoff Comp
  {
    let score = 0;
    const reasons: string[] = [];
    const pickHeroes = enemyHeroes.filter(h => h.playstyleTags.includes('Pickoff'));
    score += pickHeroes.length * 3;
    if (pickHeroes.length > 0) reasons.push(`${pickHeroes.map(h => h.name).join(', ')} excel at catching targets`);
    const ccHeroes = enemyHeroes.filter(h => h.playstyleTags.includes('CC'));
    if (ccHeroes.length >= 2 && pickHeroes.length >= 1) {
      score += 2;
      reasons.push('CC chains enable picks');
    }
    styles.push({ style: 'Pickoff Comp', score, reasons });
  }

  // Teamfight Comp
  {
    let score = 0;
    const reasons: string[] = [];
    const teamfighters = enemyHeroes.filter(h => h.playstyleTags.includes('Teamfight'));
    score += teamfighters.length * 2.5;
    if (teamfighters.length > 0) reasons.push(`${teamfighters.map(h => h.name).join(', ')} thrive in teamfights`);
    const hasTank = enemyHeroes.some(h => h.primaryRole === 'Tank');
    const hasMage = enemyHeroes.some(h => h.primaryRole === 'Mage');
    const hasMM = enemyHeroes.some(h => h.primaryRole === 'Marksman');
    if (hasTank && hasMage && hasMM) { score += 3; reasons.push('Well-rounded front-to-back composition'); }
    styles.push({ style: 'Teamfight Comp', score, reasons });
  }

  // Split Push Comp
  {
    let score = 0;
    const reasons: string[] = [];
    const splitters = enemyHeroes.filter(h => h.playstyleTags.includes('Splitpush'));
    score += splitters.length * 4;
    if (splitters.length > 0) reasons.push(`${splitters.map(h => h.name).join(', ')} can split push effectively`);
    styles.push({ style: 'Split Push Comp', score, reasons });
  }

  // Sort and pick top 2 styles
  styles.sort((a, b) => b.score - a.score);
  const topStyles = styles.filter(s => s.score >= 3).slice(0, 2);

  const styleClassification = topStyles.map(s => s.style);
  const styleExplanation = topStyles.length > 0
    ? topStyles.map(s => {
        const reasonStr = s.reasons.join('; ');
        return `**${s.style}**: ${reasonStr}.`;
      }).join(' ')
    : 'Enemy composition style is not yet clear with current picks.';

  // Reuse analyzeAllyComp logic for enemy warnings/strengths
  const enemyWarnings: CompWarning[] = [];
  const enemyStrengths: string[] = [];

  const avgBurst = enemyHeroes.reduce((s, h) => s + h.burstScore, 0) / enemyHeroes.length;
  if (avgBurst >= 7) enemyStrengths.push('Extremely high burst damage');
  const avgSustain = enemyHeroes.reduce((s, h) => s + h.sustainScore, 0) / enemyHeroes.length;
  if (avgSustain >= 6) enemyStrengths.push('High sustain');
  const avgPeel = enemyHeroes.reduce((s, h) => s + h.peelScore, 0) / enemyHeroes.length;
  if (avgPeel >= 6) enemyStrengths.push('Strong peeling');

  return {
    warnings: enemyWarnings,
    strengths: enemyStrengths,
    styleClassification,
    styleExplanation,
  };
}
