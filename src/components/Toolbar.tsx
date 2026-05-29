import { Pen, Eraser, Trash2, Download, Minus, Plus, Circle } from 'lucide-react';
import type { ToolbarState } from '../types';

interface Props {
  toolbar: ToolbarState;
  onChange: (t: Partial<ToolbarState>) => void;
  onClear: () => void;
  onSave: () => void;
  gestureActive: boolean;
}

const COLORS = [
  '#f8fafc', '#38bdf8', '#34d399', '#fbbf24',
  '#f87171', '#e879f9', '#fb923c', '#a78bfa',
];

export function Toolbar({ toolbar, onChange, onClear, onSave }: Props) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl">
      {/* Tool buttons */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => onChange({ tool: 'pen' })}
          title="Pen tool"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            toolbar.tool === 'pen'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Pen size={18} />
        </button>
        <button
          onClick={() => onChange({ tool: 'eraser' })}
          title="Eraser"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            toolbar.tool === 'eraser'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Eraser size={18} />
        </button>
      </div>

      <div className="w-full h-px bg-slate-700" />

      {/* Color palette */}
      <div className="flex flex-col gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ color: c, tool: 'pen' })}
            className={`w-7 h-7 mx-auto rounded-full transition-all border-2 hover:scale-110 ${
              toolbar.color === c ? 'border-white scale-110' : 'border-transparent'
            }`}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="w-full h-px bg-slate-700" />

      {/* Stroke width */}
      <div className="flex flex-col gap-1 items-center">
        <button
          onClick={() => onChange({ lineWidth: Math.max(2, toolbar.lineWidth - 2) })}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
        >
          <Minus size={14} />
        </button>
        <div className="flex items-center justify-center w-8 h-8">
          <Circle
            size={toolbar.lineWidth}
            fill={toolbar.color}
            stroke="none"
            style={{ maxWidth: 24, maxHeight: 24 }}
          />
        </div>
        <button
          onClick={() => onChange({ lineWidth: Math.min(30, toolbar.lineWidth + 2) })}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="w-full h-px bg-slate-700" />

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={onSave}
          title="Save as PNG"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"
        >
          <Download size={18} />
        </button>
        <button
          onClick={onClear}
          title="Clear board"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
