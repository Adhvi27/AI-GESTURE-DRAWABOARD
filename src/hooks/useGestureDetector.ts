import { useRef, useEffect, useCallback, useState } from 'react';
import type { Point, GestureState } from '../types';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

export function useGestureDetector(
  videoRef: React.RefObject<HTMLVideoElement>,
  onGestureUpdate: (state: GestureState) => void,
  enabled: boolean
) {
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const lastPointRef = useRef<Point | null>(null);
  const smoothingRef = useRef<Point | null>(null);
  const lostTrackingAtRef = useRef<number>(0);
  const DEBOUNCE_MS = 300;

  const handleResults = useCallback((results: any) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      // Debounce tracking loss to prevent flip from brief detection gaps
      if (!lostTrackingAtRef.current) {
        lostTrackingAtRef.current = Date.now();
      }
      if (Date.now() - lostTrackingAtRef.current > DEBOUNCE_MS) {
        onGestureUpdate({
          mode: 'idle',
          fingertip: null,
          isTracking: false,
          confidence: 0,
          gesture: 'none',
        });
        lastPointRef.current = null;
        smoothingRef.current = null;
      }
      return;
    }

    lostTrackingAtRef.current = 0;

    const landmarks = results.multiHandLandmarks[0];
    const indexTip = landmarks[8];
    const confidence = results.multiHandedness?.[0]?.score ?? 1;

    // Smooth fingertip position
    const currentPoint: Point = { x: indexTip.x, y: indexTip.y };

    if (!smoothingRef.current) {
      smoothingRef.current = currentPoint;
    } else {
      // Exponential moving average for smoother tracking
      const alpha = 0.4;
      smoothingRef.current = {
        x: alpha * currentPoint.x + (1 - alpha) * smoothingRef.current.x,
        y: alpha * currentPoint.y + (1 - alpha) * smoothingRef.current.y,
      };
    }

    // Determine drawing mode: index finger extended = draw
    const indexTipY = landmarks[8].y;
    const indexPipY = landmarks[6].y;
    const isIndexUp = indexTipY < indexPipY;

    const mode = isIndexUp ? 'draw' : 'idle';

    onGestureUpdate({
      mode,
      fingertip: smoothingRef.current,
      isTracking: true,
      confidence,
      gesture: isIndexUp ? 'draw' : 'none',
    });
  }, [onGestureUpdate]);

  useEffect(() => {
    if (!enabled) return;

    const initHands = () => {
      if (!window.Hands || !window.Camera) {
        setTimeout(initHands, 300);
        return;
      }

      const hands = new window.Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6,
      });

      hands.onResults(handleResults);
      handsRef.current = hands;

      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });
        camera.start();
        cameraRef.current = camera;
        setReady(true);
      }
    };

    initHands();

    return () => {
      cameraRef.current?.stop();
      handsRef.current?.close();
      setReady(false);
    };
  }, [enabled, videoRef, handleResults]);

  return { ready };
}
