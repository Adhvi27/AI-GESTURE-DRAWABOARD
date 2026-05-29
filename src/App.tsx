import { useState, useRef, useCallback, useEffect } from 'react';
import { Layers, Wifi, WifiOff } from 'lucide-react';
import { GestureCanvas, type GestureCanvasHandle } from './components/GestureCanvas';
import { Toolbar } from './components/Toolbar';
import { WebcamPreview } from './components/WebcamPreview';
import { useGestureDetector } from './hooks/useGestureDetector';
import type { GestureState, Stroke, ToolbarState } from './types';

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

export default function App() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [toolbar, setToolbar] = useState<ToolbarState>({
    color: '#f8fafc',
    lineWidth: 5,
    tool: 'pen',
  });
  const [gestureState, setGestureState] = useState<GestureState>({
    mode: 'idle',
    fingertip: null,
    isTracking: false,
    confidence: 0,
    gesture: 'none',
  });
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [roomCode] = useState(generateRoomCode);
  const [strokeCount, setStrokeCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<GestureCanvasHandle>(null);

  const handleGestureUpdate = useCallback((state: GestureState) => {
    setGestureState(state);
  }, []);

  const { ready: gestureReady } = useGestureDetector(videoRef, handleGestureUpdate, cameraEnabled);

  const handleStrokeAdd = useCallback((stroke: Stroke) => {
    setStrokes((prev) => [...prev, stroke]);
    setStrokeCount((c) => c + 1);
  }, []);

  const handleClear = useCallback(() => {
    setStrokes([]);
    canvasRef.current?.clearCanvas();
    setStrokeCount(0);
  }, []);

  const handleSave = useCallback(() => {
    const dataURL = canvasRef.current?.getDataURL();
    if (!dataURL) return;

    const link = document.createElement('a');
    link.download = `airboard-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">AirBoard</h1>
            <p className="text-slate-400 text-xs mt-0.5">AI Hand Drawing Board</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <div className={`w-2 h-2 rounded-full ${gestureReady ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-slate-300 text-xs font-mono font-semibold">{roomCode}</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span className="text-slate-300 text-xs font-mono">{strokeCount} strokes</span>
          </div>
        </div>
      </header>

      {/* Main board area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <div className="flex flex-col items-center py-4 px-3 gap-3 z-10">
          <Toolbar
            toolbar={toolbar}
            onChange={(t) => setToolbar((prev) => ({ ...prev, ...t }))}
            onClear={handleClear}
            onSave={handleSave}
            gestureActive={cameraEnabled}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />

          {cameraEnabled && (
            <div
              className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all z-10 ${
                gestureState.isTracking
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  gestureState.isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              {gestureState.isTracking ? 'Hand Detected' : 'Show your hand'}
            </div>
          )}

          <GestureCanvas
            ref={canvasRef}
            gestureState={gestureState}
            toolbarState={toolbar}
            strokes={strokes}
            onStrokeAdd={handleStrokeAdd}
            onClear={handleClear}
          />

          {strokes.length === 0 && !cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-3">
                <div className="text-6xl opacity-20">✍️</div>
                <p className="text-slate-500 text-lg font-medium">Start drawing with your mouse</p>
                <p className="text-slate-600 text-sm">or enable the camera for AI hand tracking</p>
              </div>
            </div>
          )}
          {strokes.length === 0 && cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-3">
                <div className="text-6xl opacity-30">✋</div>
                <p className="text-slate-500 text-lg font-medium">Move your hand to draw</p>
                <p className="text-slate-600 text-sm">Point your index finger at the camera</p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel — webcam */}
        <div className="flex flex-col items-center py-4 px-3 gap-4 z-10">
          <WebcamPreview
            ref={videoRef}
            active={cameraEnabled}
            onToggle={() => setCameraEnabled((v) => !v)}
            gestureLabel=""
            isTracking={gestureState.isTracking}
            confidence={gestureState.confidence}
          />

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {gestureReady ? (
              <>
                <Wifi size={13} className="text-emerald-400" />
                <span className="text-emerald-400">AI Ready</span>
              </>
            ) : (
              <>
                <WifiOff size={13} />
                <span>AI Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
