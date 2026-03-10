import type { CoachNote } from '../types';
import { MessageSquare } from 'lucide-react';

interface CoachNotesProps {
  notes: CoachNote;
}

function NoteSection({ title, content, color }: { title: string; content: string; color: string }) {
  if (!content) return null;
  return (
    <div className="space-y-1.5">
      <h4 className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{title}</h4>
      <p className="text-xs text-slate-300 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100">$1</strong>')
        }}
      />
    </div>
  );
}

export default function CoachNotes({ notes }: CoachNotesProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} className="text-gold" />
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Coach Notes</h3>
      </div>

      <div className="space-y-4 bg-surface-800/50 border border-surface-700 rounded-xl p-4">
        <NoteSection
          title="What your team needs"
          content={notes.teamMissing}
          color="text-brand-400"
        />
        <NoteSection
          title="Enemy game plan"
          content={notes.enemyStrategy}
          color="text-red-400"
        />
        <NoteSection
          title="Top pick reasoning"
          content={notes.pickLogic}
          color="text-emerald-400"
        />
        <NoteSection
          title="Heroes to avoid"
          content={notes.heroesToAvoid}
          color="text-orange-400"
        />
      </div>

      <p className="text-[10px] text-slate-600 mt-2 text-center">
        Analysis generated from draft state and scoring engine — no AI API used
      </p>
    </div>
  );
}
