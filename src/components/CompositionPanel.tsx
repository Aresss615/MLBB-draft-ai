import type React from 'react';
import type { CompWarning, CompStyle, CompAnalysis } from '../types';
import { Shield, AlertTriangle, CheckCircle, Zap, Target } from 'lucide-react';

interface CompositionPanelProps {
  allyWarnings: CompWarning[];
  allyStrengths: string[];
  enemyAnalysis: CompAnalysis;
}

const warningIcons: Partial<Record<CompWarning, React.JSX.Element>> = {
  'Lacks frontline': <Shield size={12} className="text-red-400" />,
  'Lacks engage': <Zap size={12} className="text-orange-400" />,
  'Too squishy': <AlertTriangle size={12} className="text-red-400" />,
  'Balanced comp': <CheckCircle size={12} className="text-emerald-400" />,
};

const warningColors: Record<string, string> = {
  'Balanced comp': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
};

const defaultWarningColor = 'bg-red-500/10 border-red-500/20 text-red-300';

const styleColors: Partial<Record<CompStyle, string>> = {
  'Dive Comp': 'bg-red-500/15 border-red-500/30 text-red-300',
  'Poke Comp': 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  'Burst Comp': 'bg-orange-500/15 border-orange-500/30 text-orange-300',
  'Sustain Comp': 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  'Scaling Comp': 'bg-purple-500/15 border-purple-500/30 text-purple-300',
  'Pickoff Comp': 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  'Teamfight Comp': 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
  'Split Push Comp': 'bg-pink-500/15 border-pink-500/30 text-pink-300',
};

export default function CompositionPanel({ allyWarnings, allyStrengths, enemyAnalysis }: CompositionPanelProps) {
  return (
    <div className="space-y-5">
      {/* Ally Composition Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-brand-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Team Analysis</h3>
        </div>

        {allyWarnings.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Pick heroes to see composition analysis.</p>
        ) : (
          <div className="space-y-1.5">
            {allyWarnings.map(w => (
              <div
                key={w}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${warningColors[w] || defaultWarningColor}`}
              >
                {warningIcons[w] || <AlertTriangle size={12} />}
                {w}
              </div>
            ))}
          </div>
        )}

        {allyStrengths.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {allyStrengths.map(s => (
              <div
                key={s}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-300 text-xs font-medium"
              >
                <CheckCircle size={12} />
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enemy Composition Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-red-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Enemy Strategy</h3>
        </div>

        {enemyAnalysis.styleClassification.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Enemy picks needed to classify their strategy.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {enemyAnalysis.styleClassification.map(style => (
                <span
                  key={style}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${styleColors[style] || 'bg-surface-800 border-surface-600 text-slate-300'}`}
                >
                  {style}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: enemyAnalysis.styleExplanation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>') }}
            />
          </>
        )}

        {enemyAnalysis.strengths.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Enemy Strengths</div>
            {enemyAnalysis.strengths.map(s => (
              <div
                key={s}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-red-500/10 border-red-500/20 text-red-300 text-xs font-medium"
              >
                <AlertTriangle size={12} />
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
