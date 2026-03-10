import type { DraftState, CoachNote, Recommendation, BanRecommendation, CompWarning, CompStyle, UserPreferences } from '../types';
import { getHeroById } from '../data/heroes';

// ─── Rule-Based Coach Explanation Generator ───
// This module generates natural-language coaching notes purely from
// draft state + scoring results. No LLM needed.
// Designed to be replaced by an AI adapter in the future.

interface CoachInput {
  draft: DraftState;
  pickRecs: Recommendation[];
  banRecs: BanRecommendation[];
  allyWarnings: CompWarning[];
  allyStrengths: string[];
  enemyStyles: CompStyle[];
  enemyStyleExplanation: string;
  enemyStrengths: string[];
  prefs: UserPreferences;
}

export function generateCoachNotes(input: CoachInput): CoachNote {
  const {
    draft, pickRecs, banRecs, allyWarnings, allyStrengths,
    enemyStyles, enemyStyleExplanation, enemyStrengths, prefs,
  } = input;

  const allyHeroes = draft.allyPicks
    .map(s => s.heroId ? getHeroById(s.heroId) : null)
    .filter(Boolean);
  const enemyHeroes = draft.enemyPicks
    .map(s => s.heroId ? getHeroById(s.heroId) : null)
    .filter(Boolean);

  const allyCount = allyHeroes.length;
  const enemyCount = enemyHeroes.length;

  // ── Team Missing ──
  let teamMissing = '';
  if (allyCount === 0) {
    teamMissing = 'Draft is empty. Start by securing a high-priority meta pick or a flex hero that doesn\'t reveal your strategy.';
  } else {
    const realWarnings = allyWarnings.filter(w => w !== 'Balanced comp');
    if (realWarnings.length > 0) {
      teamMissing = `Your team currently ${realWarnings.length === 1 ? 'has a gap' : 'has some gaps'}: ${realWarnings.join(', ').toLowerCase()}. `;
      // Specific advice
      if (realWarnings.includes('Lacks frontline')) {
        teamMissing += 'Prioritize a Tank or durable Fighter to absorb damage. ';
      }
      if (realWarnings.includes('Lacks engage')) {
        teamMissing += 'Consider a hero with strong initiation tools. ';
      }
      if (realWarnings.includes('Too much physical damage') || realWarnings.includes('Too much magic damage')) {
        teamMissing += 'The enemy can itemize cheaply against single damage types — diversify your damage. ';
      }
      if (realWarnings.includes('Weak late game')) {
        teamMissing += 'Your team needs to end games early. If you can\'t, consider adding a scaling carry. ';
      }
      if (realWarnings.includes('Low backline safety')) {
        teamMissing += 'Your carries are exposed. Add a peeling support or tank. ';
      }
    } else {
      teamMissing = 'Your composition looks well-rounded so far. ';
      if (allyStrengths.length > 0) {
        teamMissing += `Strengths: ${allyStrengths.join(', ')}. `;
      }
      teamMissing += 'Focus on rounding out remaining roles and maintaining synergy.';
    }
  }

  // ── Enemy Strategy ──
  let enemyStrategy = '';
  if (enemyCount === 0) {
    enemyStrategy = 'No enemy picks yet. Expect them to pick meta-priority heroes first. Be ready to counter-pick their core carry.';
  } else {
    if (enemyStyles.length > 0) {
      enemyStrategy = `The enemy is building toward a **${enemyStyles.join(' / ')}** strategy. ${enemyStyleExplanation} `;
    } else {
      enemyStrategy = 'The enemy composition style is not yet clear. ';
    }
    if (enemyStrengths.length > 0) {
      enemyStrategy += `Watch out for: ${enemyStrengths.join(', ')}. `;
    }
    // Counter advice based on enemy style
    if (enemyStyles.includes('Dive Comp')) {
      enemyStrategy += 'Counter with strong peeling heroes and anti-dive tools like Valir or Diggie.';
    }
    if (enemyStyles.includes('Poke Comp')) {
      enemyStrategy += 'Counter with hard engage to close the gap and force all-ins.';
    }
    if (enemyStyles.includes('Scaling Comp')) {
      enemyStrategy += 'Punish their weak early game with aggressive early picks and snowball heroes.';
    }
    if (enemyStyles.includes('Burst Comp')) {
      enemyStrategy += 'Consider tanky heroes and sustain to survive their burst windows.';
    }
    if (enemyStyles.includes('Sustain Comp')) {
      enemyStrategy += 'Anti-heal items will be essential. Pick burst damage to cut through their healing.';
    }
  }

  // ── Pick Logic ──
  let pickLogic = '';
  if (pickRecs.length > 0) {
    const topPick = pickRecs[0];
    const topHero = getHeroById(topPick.heroId);
    if (topHero) {
      pickLogic = `**${topHero.name}** (${topPick.totalScore.toFixed(1)} pts) is currently the strongest pick. `;
      if (topPick.badges.includes('Strong Counter')) {
        pickLogic += `They directly counter enemy picks. `;
      }
      if (topPick.badges.includes('Good Synergy')) {
        pickLogic += `They synergize well with your current team. `;
      }
      if (topPick.badges.includes('Role Fill')) {
        pickLogic += `They fill a needed role. `;
      }
      pickLogic += topPick.reason + '. ';
    }
    if (pickRecs.length >= 3) {
      const otherPicks = pickRecs.slice(1, 3).map(r => {
        const h = getHeroById(r.heroId);
        return h ? h.name : r.heroId;
      });
      pickLogic += `Other strong options: ${otherPicks.join(', ')}.`;
    }
  } else {
    pickLogic = 'All recommendation slots are filled. Your draft is complete.';
  }

  // ── Heroes to Avoid ──
  let heroesToAvoid = '';
  const avoidReasons: string[] = [];

  // Check if enemy has strong counters to common picks
  if (enemyCount > 0) {
    const enemyNames = draft.enemyPicks
      .map(s => s.heroId ? getHeroById(s.heroId) : null)
      .filter(Boolean);

    // Avoid heroes that enemy comp counters
    const riskyPicks = pickRecs
      .filter(r => r.badges.includes('High Risk'))
      .slice(0, 2);

    if (riskyPicks.length > 0) {
      const names = riskyPicks.map(r => {
        const h = getHeroById(r.heroId);
        return h ? h.name : '';
      }).filter(Boolean);
      avoidReasons.push(`${names.join(', ')} ${names.length === 1 ? 'is' : 'are'} risky — the enemy can counter ${names.length === 1 ? 'it' : 'them'}`);
    }

    // Avoid immobile heroes vs dive
    if (enemyStyles.includes('Dive Comp')) {
      avoidReasons.push('Avoid immobile mages without self-peel — the enemy dive will destroy them');
    }

    // Avoid scaling vs early comp
    if (enemyStyles.includes('Burst Comp') || enemyNames.some(h => h && h.playstyleTags.includes('Snowball'))) {
      avoidReasons.push('Be cautious with late-game scaling picks — the enemy wants to end fast');
    }
  }

  if (allyWarnings.includes('Too much physical damage')) {
    avoidReasons.push('Avoid more physical damage heroes — the enemy will stack armor');
  }
  if (allyWarnings.includes('Too much magic damage')) {
    avoidReasons.push('Avoid more magic damage heroes — the enemy will stack magic resist');
  }

  if (prefs.mode === 'solo') {
    avoidReasons.push('In solo queue, avoid highly team-dependent heroes unless you trust coordination');
  }

  heroesToAvoid = avoidReasons.length > 0
    ? avoidReasons.join('. ') + '.'
    : 'No specific heroes to avoid right now. Stay flexible and react to enemy picks.';

  return { teamMissing, enemyStrategy, pickLogic, heroesToAvoid };
}

// ─── Future AI Adapter Interface ───
// When a real LLM is connected, replace generateCoachNotes
// with a call to the adapter below.

export interface AIAdapter {
  generateExplanation(input: CoachInput): Promise<CoachNote>;
}

// Placeholder for cloud LLM (GPT, Claude, etc.)
export class CloudAIAdapter implements AIAdapter {
  endpoint: string;
  apiKey: string;
  model: string;
  constructor(endpoint: string, apiKey: string, model: string = 'gpt-4') {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateExplanation(input: CoachInput): Promise<CoachNote> {
    // In a real implementation:
    // const response = await fetch(this.endpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: this.model,
    //     messages: [
    //       { role: 'system', content: 'You are an expert MLBB draft coach...' },
    //       { role: 'user', content: JSON.stringify(input) },
    //     ],
    //   }),
    // });
    // return parseAIResponse(response);

    // Fallback to rule-based
    return generateCoachNotes(input);
  }
}

// Placeholder for local Ollama
export class OllamaAdapter implements AIAdapter {
  endpoint: string;
  model: string;
  constructor(endpoint: string = 'http://localhost:11434/api/generate', model: string = 'llama3') {
    this.endpoint = endpoint;
    this.model = model;
  }

  async generateExplanation(input: CoachInput): Promise<CoachNote> {
    // In a real implementation:
    // const response = await fetch(this.endpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     model: this.model,
    //     prompt: `Analyze this MLBB draft and provide coaching notes:\n${JSON.stringify(input)}`,
    //     stream: false,
    //   }),
    // });
    // return parseOllamaResponse(response);

    // Fallback to rule-based
    return generateCoachNotes(input);
  }
}
