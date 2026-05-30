import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { GestureState, Point, Stroke, ToolbarState } from '../types';

interface Props {
  gestureState: GestureState;
  toolbarState: ToolbarState;
  strokes: Stroke[];
  onStrokeAdd: (stroke: Stroke) => void;
  onStrokesRemove?: (strokeIds: string[]) => void;
  onClear: () => void;
}

export interface GestureCanvasHandle {
  getDataURL: () => string;
  clearCanvas: () => void;
}

export const GestureCanvas = forwardRef<GestureCanvasHandle, Props>(
  ({ gestureState, toolbarState, strokes, onStrokeAdd, onStrokesRemove }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const currentStrokeRef = useRef<Point[]>([]);
    const isDrawingRef = useRef(false);
    const prevTrackingRef = useRef(false);
    const lastFingertipRef = useRef<Point | null>(null);

    useImperativeHandle(ref, () => ({
      getDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
      clearCanvas: () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      },
    }));

    const redrawAllStrokes = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const stroke of strokes) {
        if (stroke.points.length < 2) continue;
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(stroke.points[0].x * canvas.width, stroke.points[0].y * canvas.height);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x * canvas.width, stroke.points[i].y * canvas.height);
        }
        ctx.stroke();
      }
    }, [strokes]);

    useEffect(() => {
      redrawAllStrokes();
    }, [redrawAllStrokes]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;
      if (!canvas || !overlay) return;

      const resize = () => {
        const rect = canvas.parentElement!.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        overlay.width = rect.width;
        overlay.height = rect.height;
        redrawAllStrokes();
      };

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas.parentElement!);
      return () => ro.disconnect();
    }, [redrawAllStrokes]);

    // Mouse/touch drawing
    const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        x: (clientX - rect.left) / canvas.width,
        y: (clientY - rect.top) / canvas.height,
      };
    };

    const startMouseDraw = (e: React.MouseEvent | React.TouchEvent) => {
      isDrawingRef.current = true;
      const pt = getCanvasPoint(e);
      currentStrokeRef.current = [pt];
      lastFingertipRef.current = pt;
    };

    const continueMouseDraw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawingRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const pt = getCanvasPoint(e);
      currentStrokeRef.current.push(pt);

      if (lastFingertipRef.current) {
        ctx.beginPath();
        ctx.strokeStyle = toolbarState.color;
        ctx.lineWidth = toolbarState.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastFingertipRef.current.x * canvas.width, lastFingertipRef.current.y * canvas.height);
        ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
        ctx.stroke();
      }
      lastFingertipRef.current = pt;
    };

    const endMouseDraw = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      if (currentStrokeRef.current.length > 1) {
        const stroke: Stroke = {
          id: crypto.randomUUID(),
          points: [...currentStrokeRef.current],
          color: toolbarState.color,
          lineWidth: toolbarState.lineWidth,
          timestamp: Date.now(),
        };
        onStrokeAdd(stroke);
      }
      currentStrokeRef.current = [];
      lastFingertipRef.current = null;
    };

    // Hand tracking drawing
    useEffect(() => {
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;
      if (!canvas || !overlay) return;

      const ctx = canvas.getContext('2d')!;
      const octx = overlay.getContext('2d')!;
      octx.clearRect(0, 0, overlay.width, overlay.height);

      const { fingertip, isTracking, mode } = gestureState;

      // Start/end stroke on tracking state change
      if (isTracking && !prevTrackingRef.current) {
        currentStrokeRef.current = [];
        lastFingertipRef.current = null;
      }

      if (!isTracking && prevTrackingRef.current) {
        if (currentStrokeRef.current.length > 1) {
          const stroke: Stroke = {
            id: crypto.randomUUID(),
            points: [...currentStrokeRef.current],
            color: toolbarState.color,
            lineWidth: toolbarState.lineWidth,
            timestamp: Date.now(),
          };
          onStrokeAdd(stroke);
        }
        currentStrokeRef.current = [];
        lastFingertipRef.current = null;
      }

      prevTrackingRef.current = isTracking;

      if (!fingertip || !isTracking) {
        return;
      }

      // Mirror x to match the flipped webcam view (mirror-like experience)
      const px = (1 - fingertip.x) * canvas.width;
      const py = fingertip.y * canvas.height;

      // Draw cursor overlay
      const cursorColor = mode === 'erase' ? '#ef4444' : '#38bdf8';
      octx.clearRect(0, 0, overlay.width, overlay.height);
      octx.beginPath();
      octx.arc(px, py, 12, 0, Math.PI * 2);
      octx.fillStyle = cursorColor + '40';
      octx.fill();
      octx.beginPath();
      octx.arc(px, py, 6, 0, Math.PI * 2);
      octx.strokeStyle = cursorColor;
      octx.lineWidth = 2;
      octx.stroke();

      // Only draw if in draw mode (index finger up)
      if (mode === 'draw') {
        // Store mirrored coordinates so redraw is consistent
        const mirroredPoint = { x: 1 - fingertip.x, y: fingertip.y };
        currentStrokeRef.current.push(mirroredPoint);

        if (lastFingertipRef.current) {
          ctx.beginPath();
          ctx.strokeStyle = toolbarState.color;
          ctx.lineWidth = toolbarState.lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.moveTo(lastFingertipRef.current.x * canvas.width, lastFingertipRef.current.y * canvas.height);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
        lastFingertipRef.current = mirroredPoint;
      } else if (mode === 'erase') {
        // Erase strokes that touch the cursor
        const eraserRadius = 15;
        const erasedIds = new Set<string>();
        const mirroredPoint = { x: 1 - fingertip.x, y: fingertip.y };

        for (const stroke of strokes) {
          for (const pt of stroke.points) {
            const dx = (pt.x - mirroredPoint.x) * canvas.width;
            const dy = (pt.y - mirroredPoint.y) * canvas.height;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < eraserRadius) {
              erasedIds.add(stroke.id);
              break;
            }
          }
        }

        if (erasedIds.size > 0) {
          onStrokesRemove?.(Array.from(erasedIds));
        }

        lastFingertipRef.current = null;
      } else {
        lastFingertipRef.current = null;
      }
    }, [gestureState, toolbarState, onStrokeAdd, strokes, onStrokesRemove]);

    return (
      <div className="relative w-full h-full select-none">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={startMouseDraw}
          onMouseMove={continueMouseDraw}
          onMouseUp={endMouseDraw}
          onMouseLeave={endMouseDraw}
          onTouchStart={startMouseDraw}
          onTouchMove={continueMouseDraw}
          onTouchEnd={endMouseDraw}
        />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>
    );
  }
);

GestureCanvas.displayName = 'GestureCanvas';
