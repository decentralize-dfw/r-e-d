/**
 * Camera Manager - Handles camera setup and switching
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { APP_CONFIG } from '@/config/app.config';
import type { CameraConfig } from '@/types';

export class CameraManager {
  perspectiveCamera: THREE.PerspectiveCamera;
  orthographicCamera: THREE.OrthographicCamera;
  activeCamera: THREE.Camera;
  
  orbitControls: OrbitControls;
  pointerLockControls: PointerLockControls;
  
  playerRig: THREE.Group;
  audioListener: THREE.AudioListener;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    // Create cameras
    this.perspectiveCamera = this.createPerspectiveCamera();
    this.orthographicCamera = this.createOrthographicCamera();
    this.activeCamera = this.perspectiveCamera;
    
    // Create player rig for VR
    this.playerRig = new THREE.Group();
    scene.add(this.playerRig);
    this.playerRig.add(this.activeCamera);
    
    // Create audio listener
    this.audioListener = new THREE.AudioListener();
    this.activeCamera.add(this.audioListener);
    
    // Create controls
    this.orbitControls = new OrbitControls(this.activeCamera, renderer.domElement);
    this.orbitControls.enabled = false;
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.target.set(0, 1, 0);
    
    this.pointerLockControls = new PointerLockControls(
      this.perspectiveCamera,
      renderer.domElement
    );
    scene.add(this.pointerLockControls.getObject());
  }

  private createPerspectiveCamera(): THREE.PerspectiveCamera {
    const config = APP_CONFIG.camera.perspective;
    return new THREE.PerspectiveCamera(
      config.fov,
      window.innerWidth / window.innerHeight,
      config.near,
      config.far
    );
  }

  private createOrthographicCamera(): THREE.OrthographicCamera {
    const config = APP_CONFIG.camera.orthographic;
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = config.frustumSize;
    
    return new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      config.near,
      config.far
    );
  }

  setupCamera(config: CameraConfig, isVR: boolean): void {
    // Disable all controls first
    this.orbitControls.enabled = false;
    this.orbitControls.autoRotate = false;
    if (this.pointerLockControls.isLocked) {
      this.pointerLockControls.unlock();
    }
    
    // Determine camera type
    let newCamera = config.cameraType === 'orthographic' 
      ? this.orthographicCamera 
      : this.perspectiveCamera;
    
    if (config.type === 'pointerlock') {
      newCamera = this.perspectiveCamera; // Pointer lock requires perspective
    }
    
    // Switch camera if needed
    if (this.activeCamera !== newCamera) {
      this.switchCamera(newCamera);
    }
    
    // Apply camera settings
    const pos = config.pos || { x: 0, y: 5, z: 10 };
    const lookAt = config.lookAt || { x: 0, y: 1, z: 0 };
    
    if (config.type === 'orbit' || config.type === 'static_orbit') {
      this.setupOrbitMode(config, pos, lookAt, isVR);
    } else if (config.type === 'pointerlock') {
      this.setupPointerLockMode(pos, config.fov, isVR);
    }
  }

  private switchCamera(newCamera: THREE.Camera): void {
    // Remove old camera from rig
    if (this.playerRig.children.includes(this.activeCamera)) {
      this.playerRig.remove(this.activeCamera);
    }
    
    // Update active camera
    this.activeCamera = newCamera;
    
    // Add new camera to rig
    this.playerRig.add(this.activeCamera);
    
    // Move audio listener
    this.activeCamera.add(this.audioListener);
    
    // Update orbit controls
    this.orbitControls.object = this.activeCamera;
  }

  private setupOrbitMode(
    config: CameraConfig,
    pos: { x: number; y: number; z: number },
    lookAt: { x: number; y: number; z: number },
    isVR: boolean
  ): void {
    if (isVR) {
      this.playerRig.position.set(pos.x, pos.y, pos.z);
    } else {
      this.activeCamera.position.set(pos.x, pos.y, pos.z);
      this.activeCamera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }
    
    this.orbitControls.target.set(lookAt.x, lookAt.y, lookAt.z);
    this.orbitControls.autoRotate = config.autoRotate || false;
    this.orbitControls.autoRotateSpeed = config.autoRotateSpeed || 1.0;
    
    this.orbitControls.minPolarAngle = config.minPolar || 0;
    this.orbitControls.maxPolarAngle = config.maxPolar !== undefined 
      ? config.maxPolar 
      : (Math.PI / 2) * 0.98;
    this.orbitControls.minAzimuthAngle = config.minAzimuth || -Infinity;
    this.orbitControls.maxAzimuthAngle = config.maxAzimuth || Infinity;
    
    this.orbitControls.enablePan = config.enablePan !== undefined ? config.enablePan : true;
    this.orbitControls.enableZoom = config.enableZoom !== undefined ? config.enableZoom : true;
    this.orbitControls.enableRotate = config.enableRotate !== undefined ? config.enableRotate : true;
    
    // Set camera projection
    if (config.cameraType === 'orthographic') {
      const aspect = window.innerWidth / window.innerHeight;
      const frustumSize = APP_CONFIG.camera.orthographic.frustumSize;
      const orthoCamera = this.activeCamera as THREE.OrthographicCamera;
      orthoCamera.left = (frustumSize * aspect) / -2;
      orthoCamera.right = (frustumSize * aspect) / 2;
      orthoCamera.top = frustumSize / 2;
      orthoCamera.bottom = frustumSize / -2;
      orthoCamera.updateProjectionMatrix();
    } else {
      const perspCamera = this.activeCamera as THREE.PerspectiveCamera;
      perspCamera.fov = config.fov || 75;
      perspCamera.updateProjectionMatrix();
    }
    
    this.orbitControls.enabled = true;
    this.orbitControls.update();
  }

  private setupPointerLockMode(
    pos: { x: number; y: number; z: number },
    fov: number | undefined,
    isVR: boolean
  ): void {
    if (isVR) {
      this.playerRig.position.set(pos.x, pos.y, pos.z);
    } else {
      const perspCamera = this.activeCamera as THREE.PerspectiveCamera;
      perspCamera.fov = fov || 75;
      perspCamera.updateProjectionMatrix();
      
      this.pointerLockControls.getObject().position.set(pos.x, pos.y, pos.z);
      this.pointerLockControls.lock();
    }
  }

  update(delta: number): void {
    if (this.orbitControls.enabled) {
      this.orbitControls.update(delta);
    }
  }

  handleResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    
    // Update perspective camera
    this.perspectiveCamera.aspect = aspect;
    this.perspectiveCamera.updateProjectionMatrix();
    
    // Update orthographic camera
    const frustumSize = APP_CONFIG.camera.orthographic.frustumSize;
    this.orthographicCamera.left = (frustumSize * aspect) / -2;
    this.orthographicCamera.right = (frustumSize * aspect) / 2;
    this.orthographicCamera.top = frustumSize / 2;
    this.orthographicCamera.bottom = frustumSize / -2;
    this.orthographicCamera.updateProjectionMatrix();
  }

  getActiveCamera(): THREE.Camera {
    return this.activeCamera;
  }

  getAudioListener(): THREE.AudioListener {
    return this.audioListener;
  }
}
