import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const gestures = [
  { icon: '☝️', label: 'Index finger up', action: 'Draw mode — write in air' },
  { icon: '✋', label: 'All fingers up', action: 'Erase mode — erase by moving' },
  { icon: '✌️', label: 'Peace sign', action: 'Toggle erase tool' },
  { icon: '✊', label: 'Fist', action: 'Clear the entire board' },
  { icon: '👍', label: 'Thumbs up', action: 'Save board as image' },
];

export function GestureGuide({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-xl">Gesture Controls</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {gestures.map((g) => (
            <div key={g.icon} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-3xl w-10 text-center">{g.icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{g.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{g.action}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <p className="text-sky-300 text-xs leading-relaxed">
            <span className="font-semibold">Tip:</span> Make sure your hand is clearly visible in the webcam. Good lighting improves tracking accuracy. Keep your index finger pointed straight up to draw.
          </p>
        </div>
      </div>
    </div>
  );
}
