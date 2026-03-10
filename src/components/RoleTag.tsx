import type { Role } from '../types';

const roleColors: Record<Role, string> = {
  Tank: 'text-blue-400',
  Fighter: 'text-orange-400',
  Assassin: 'text-red-400',
  Mage: 'text-purple-400',
  Marksman: 'text-yellow-400',
  Support: 'text-emerald-400',
};

const roleIcons: Record<Role, string> = {
  Tank: '🛡',
  Fighter: '⚔',
  Assassin: '🗡',
  Mage: '✦',
  Marksman: '🎯',
  Support: '✚',
};

export function RoleTag({ role, size = 'sm' }: { role: Role; size?: 'sm' | 'md' }) {
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  return (
    <span className={`inline-flex items-center gap-1 ${roleColors[role]} ${textSize} font-medium`}>
      <span>{roleIcons[role]}</span>
      {role}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    'S+': 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black',
    'S': 'bg-gradient-to-r from-orange-500 to-red-400 text-white',
    'A': 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white',
    'B': 'bg-gradient-to-r from-gray-500 to-gray-400 text-white',
    'C': 'bg-gradient-to-r from-gray-600 to-gray-500 text-gray-200',
  };

  return (
    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${colors[tier] || colors['B']}`}>
      {tier}
    </span>
  );
}
