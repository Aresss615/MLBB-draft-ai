import type { Recommendation, BanRecommendation, ScoreBreakdown } from '../types';
import { getHeroById } from '../data/heroes';
import Badge from './Badge';
import { RoleTag, TierBadge } from './RoleTag';
import { Swords, ShieldBan, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface RecommendationsProps {
  pickRecs: Recommendation[];
  banRecs: BanRecommendation[];
  onPickHero?: (heroId: string) => void;
}

function ScoreBar({ value, max = 10, label }: { value: number; max?: number; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-400 w-6 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function BreakdownPanel({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div className="mt-2 pt-2 border-t border-surface-700 space-y-1 animate-slide-in">
      <ScoreBar value={breakdown.metaStrength} label="Meta" />
      <ScoreBar value={breakdown.counterValue} label="Counter" />
      <ScoreBar value={breakdown.synergyValue} label="Synergy" />
      <ScoreBar value={breakdown.roleNeed} label="Role Need" />
      <ScoreBar value={breakdown.damageBalance} label="Dmg Balance" />
      <ScoreBar value={breakdown.safety} label="Safety" />
      <ScoreBar value={breakdown.preferenceBonus} label="Pref Bonus" />
      {breakdown.riskPenalty > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-red-400 w-20 shrink-0">Risk</span>
          <div className="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
              style={{ width: `${Math.min(100, (breakdown.riskPenalty / 10) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-red-400 w-6 text-right">-{breakdown.riskPenalty.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

function PickRecCard({ rec, rank, onPick }: { rec: Recommendation; rank: number; onPick?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hero = getHeroById(rec.heroId);
  if (!hero) return null;

  const maxScore = 7;
  const scorePct = Math.min(100, (rec.totalScore / maxScore) * 100);

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-3 hover:border-surface-600 transition-all">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold text-brand-400">#{rank}</span>
          <div className="text-[10px] text-slate-500">{rec.totalScore.toFixed(2)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-100">{hero.name}</span>
            <TierBadge tier={hero.tier} />
            <RoleTag role={rec.role} size="sm" />
          </div>
          {/* Score Bar */}
          <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
              style={{ width: `${scorePct}%` }}
            />
          </div>
          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-1.5">
            {rec.badges.map(b => <Badge key={b} type={b} />)}
          </div>
          {/* Reason */}
          <p className="text-[11px] text-slate-400 leading-relaxed">{rec.reason}</p>

          {/* Expandable breakdown */}
          {expanded && <BreakdownPanel breakdown={rec.breakdown} />}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-700/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Hide' : 'Show'} Score Details
        </button>
        {onPick && (
          <button
            onClick={onPick}
            className="ml-auto px-3 py-1 text-[10px] font-semibold bg-brand-600/20 text-brand-300 rounded-md hover:bg-brand-600/40 transition-colors border border-brand-600/30"
          >
            Quick Pick
          </button>
        )}
      </div>
    </div>
  );
}

function BanRecCard({ rec, rank }: { rec: BanRecommendation; rank: number }) {
  const hero = getHeroById(rec.heroId);
  if (!hero) return null;

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-3 hover:border-surface-600 transition-all">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold text-red-400">#{rank}</span>
          <div className="text-[10px] text-slate-500">{rec.totalScore.toFixed(2)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-100">{hero.name}</span>
            <TierBadge tier={hero.tier} />
            <RoleTag role={rec.role} size="sm" />
          </div>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {rec.badges.map(b => <Badge key={b} type={b} />)}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{rec.reason}</p>
        </div>
      </div>
    </div>
  );
}

export default function Recommendations({ pickRecs, banRecs, onPickHero }: RecommendationsProps) {
  return (
    <div className="space-y-6">
      {/* Pick Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Swords size={16} className="text-brand-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Recommended Picks</h3>
        </div>
        <div className="space-y-2">
          {pickRecs.slice(0, 5).map((rec, i) => (
            <PickRecCard
              key={rec.heroId}
              rec={rec}
              rank={i + 1}
              onPick={onPickHero ? () => onPickHero(rec.heroId) : undefined}
            />
          ))}
          {pickRecs.length === 0 && (
            <div className="text-center py-6 text-sm text-slate-500">
              Start picking to see recommendations
            </div>
          )}
        </div>
      </div>

      {/* Ban Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldBan size={16} className="text-red-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Recommended Bans</h3>
        </div>
        <div className="space-y-2">
          {banRecs.slice(0, 5).map((rec, i) => (
            <BanRecCard key={rec.heroId} rec={rec} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
