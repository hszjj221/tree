export enum LightColorMode {
  WarmWhite = 'WARM_WHITE',
  MultiColor = 'MULTI_COLOR',
  BlueIce = 'BLUE_ICE'
}

export interface TreeSettings {
  lightsOn: boolean;
  colorMode: LightColorMode;
  snowEnabled: boolean;
}

// Tree particle types
export type ParticleType = 'leaf' | 'light' | 'ornament' | 'tinsel' | 'star' | 'ray' | 'trunk';

export interface TreeParticle {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  type: ParticleType;
  swayOffset: number;
  blinkOffset?: number;
  baseX: number;
  baseY: number;
  rotation?: number;
}

// MediaPipe gesture recognition configuration
export const MEDIAPIPE_CONFIG = {
  wasmUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
  modelUrl: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
  gestureThreshold: 0.35, // Lowered from 0.5 for better sensitivity
} as const;

// Gesture types
export const GESTURES = {
  OPEN_PALM: 'Open_Palm',
  CLOSED_FIST: 'Closed_Fist',
  NONE: 'None',
} as const;