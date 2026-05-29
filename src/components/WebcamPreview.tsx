import { forwardRef } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface Props {
  active: boolean;
  onToggle: () => void;
  isTracking: boolean;
  confidence: number;
}

export const WebcamPreview = forwardRef<HTMLVideoElement, Props>(
  ({ active, onToggle, isTracking, confidence }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <div
          className="relative rounded-xl overflow-hidden border border-slate-700/50 shadow-lg"
          style={{ width: 200, height: 150 }}
        >
          <video
            ref={ref}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)', display: active ? 'block' : 'none' }}
          />
          {!active && (
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
              <CameraOff size={28} className="text-slate-600" />
            </div>
          )}

          {active && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    isTracking ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                  style={{ width: `${isTracking ? confidence * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {active && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 rounded-full px-2 py-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}
              />
              <span className="text-xs text-white font-medium">
                {isTracking ? 'Tracking' : 'Searching'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            active
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
              : 'bg-slate-700/60 text-slate-300 border border-slate-600/50 hover:bg-slate-700'
          }`}
        >
          {active ? <Camera size={16} /> : <CameraOff size={16} />}
          {active ? 'Camera On' : 'Enable Camera'}
        </button>

        {active && isTracking && (
          <div className="text-center text-xs text-sky-300 font-medium bg-sky-500/10 border border-sky-500/20 rounded-lg px-2 py-1.5">
            Move hand to draw
          </div>
        )}
      </div>
    );
  }
);

WebcamPreview.displayName = 'WebcamPreview';
