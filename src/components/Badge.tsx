import type { BadgeType } from '../types';

const badgeStyles: Record<BadgeType, string> = {
  'Strong Counter': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Good Synergy': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Safe Pick': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'High Risk': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Comfort Pick': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Meta Priority': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Role Fill': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Damage Balance': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

export default function Badge({ type }: { type: BadgeType }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded border ${badgeStyles[type]}`}>
      {type}
    </span>
  );
}
