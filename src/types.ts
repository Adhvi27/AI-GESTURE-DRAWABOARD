export type DrawingMode = 'draw' | 'erase' | 'idle';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  lineWidth: number;
  timestamp: number;
}

export interface BoardSession {
  id: string;
  room_code: string;
  name: string;
  created_at: string;
}

export interface GestureState {
  mode: DrawingMode;
  fingertip: Point | null;
  isTracking: boolean;
  confidence: number;
  gesture: 'draw' | 'erase' | 'peace' | 'thumbs_up' | 'fist' | 'none';
}

export interface ToolbarState {
  color: string;
  lineWidth: number;
  tool: 'pen' | 'eraser' | 'shape';
}
