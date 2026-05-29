import { X, Trash2 } from 'lucide-react';
import type { BoardSession } from '../types';

interface Props {
  sessions: BoardSession[];
  onLoad: (session: BoardSession) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function SavedBoards({ sessions, onLoad, onDelete, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-xl">Saved Boards</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-500 text-sm">No saved boards yet. Use 👍 gesture or the save button.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-all group"
              >
                <button
                  className="flex-1 text-left"
                  onClick={() => onLoad(s)}
                >
                  <p className="text-white text-sm font-medium">{s.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {new Date(s.created_at).toLocaleString()} · Room: {s.room_code}
                  </p>
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
