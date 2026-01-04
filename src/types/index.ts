/**
 * Type definitions for the C2W2 Virtual Runway application
 */

import * as THREE from 'three';

export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export interface ModelConfig {
  id?: string;
  pos?: Vector3Like;
  rot?: Vector3Like;
  scale?: Vector3Like;
  visible?: boolean;
}

export interface LoadedModel {
  scene: THREE.Object3D;
  mixer: THREE.AnimationMixer | null;
}

export interface CameraConfig {
  type: 'orbit' | 'static_orbit' | 'pointerlock';
  cameraType?: 'perspective' | 'orthographic';
  pos?: Vector3Like;
  lookAt?: Vector3Like;
  fov?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  minPolar?: number;
  maxPolar?: number;
  minAzimuth?: number;
  maxAzimuth?: number;
}

export interface ButtonConfig {
  name: string;
  id: string;
}

export interface SceneConfig {
  name: string;
  description: string;
  models: number[];
  cameraType: 'perspective' | 'orthographic';
  controls: 'orbit' | 'pointerlock';
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableUserRotation?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  cameraPosition?: Vector3Like;
  cameraLookAt?: Vector3Like;
  buttons?: ButtonConfig[];
  cameraPositions?: Array<{
    pos: Vector3Like;
    lookAt: Vector3Like;
    fov: number;
  }>;
}

export interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
}

export interface PhysicsConfig {
  playerHeight: number;
  playerRadius: number;
  baseMoveSpeed: number;
  sprintMultiplier: number;
  jumpVelocity: number;
  gravity: number;
  friction: number;
}

export interface VRConfig {
  moveSpeed: number;
  turnSpeed: number;
  sprintThreshold: number;
}

export type ControlMode = 'desktop' | 'vr';

export interface ApplicationState {
  currentScene: number;
  experienceStarted: boolean;
  controlMode: ControlMode;
  loadedModels: LoadedModel[];
  colliderMeshes: THREE.Mesh[];
  activeSounds: THREE.Audio[];
  soundBuffers: (AudioBuffer | null)[];
}
