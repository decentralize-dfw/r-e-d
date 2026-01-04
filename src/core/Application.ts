/**
 * Application - Main application class that orchestrates all managers
 */

import * as THREE from 'three';
import { SceneManager } from '@/managers/SceneManager';
import { CameraManager } from '@/managers/CameraManager';
import { ModelLoader } from '@/managers/ModelLoader';
import { AudioManager } from '@/managers/AudioManager';
import { PhysicsManager } from '@/managers/PhysicsManager';
import { UIManager } from '@/managers/UIManager';
import { SequenceManager } from '@/managers/SequenceManager';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';

export class Application {
  private sceneManager: SceneManager;
  private cameraManager: CameraManager;
  private modelLoader: ModelLoader;
  private audioManager: AudioManager;
  private physicsManager: PhysicsManager;
  private uiManager: UIManager;
  private sequenceManager: SequenceManager;

  private experienceStarted: boolean = false;
  private isVR: boolean = false;
  private vrControllers: any[] = [];

  constructor() {
    // Initialize managers
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager(
      this.sceneManager.renderer,
      this.sceneManager.scene
    );
    this.modelLoader = new ModelLoader(this.sceneManager.scene);
    this.audioManager = new AudioManager(this.cameraManager.getAudioListener());
    this.physicsManager = new PhysicsManager();
    this.uiManager = new UIManager();
    this.sequenceManager = new SequenceManager(
      this.modelLoader,
      this.cameraManager,
      this.audioManager,
      this.uiManager,
      this.isVR
    );

    // Update composer with initial camera
    this.sceneManager.setupComposerWithCamera(this.cameraManager.getActiveCamera());

    // Setup event listeners
    this.setupEventListeners();

    // Check VR capability and initialize
    this.checkVRCapability();

    // Start animation loop
    this.sceneManager.renderer.setAnimationLoop(() => this.animate());
  }

  private async checkVRCapability(): Promise<void> {
    try {
      const vrSupported =
        navigator.xr && (await navigator.xr.isSessionSupported('immersive-vr'));

      if (vrSupported) {
        this.setupVR();
      } else {
        this.setupDesktop();
      }
    } catch (e) {
      console.error('Error checking VR support:', e);
      this.setupDesktop();
    }
  }

  private setupDesktop(): void {
    console.log('Setting up Desktop Controls');
    this.isVR = false;

    // Load environment and start experience
    this.loadInitialResources();

    // Wait for user interaction
    document.body.addEventListener('click', () => this.onInitialClick(), { once: true });
  }

  private setupVR(): void {
    console.log('Setting up VR Controls');
    this.isVR = true;

    this.uiManager.hideFullscreenButton();
    this.uiManager.hideInstructions();

    const vrButton = VRButton.createButton(this.sceneManager.renderer);
    vrButton.textContent = 'Touch to Start';
    vrButton.id = 'VRButton';
    vrButton.style.top = '15%';
    vrButton.style.left = '40%';
    vrButton.style.width = '20%';
    document.body.appendChild(vrButton);

    // Setup VR controllers
    const controllerModelFactory = new XRControllerModelFactory();

    for (let i = 0; i < 2; i++) {
      const controller = this.sceneManager.renderer.xr.getController(i);
      const controllerGrip = this.sceneManager.renderer.xr.getControllerGrip(i);
      controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
      this.cameraManager.playerRig.add(controller);
      this.cameraManager.playerRig.add(controllerGrip);
      this.vrControllers.push(controller);
    }

    // VR session listeners
    this.sceneManager.renderer.xr.addEventListener('sessionstart', () => {
      console.log('VR Session Started');
      this.experienceStarted = true;
      this.uiManager.hideBackgroundImage();
      this.sequenceManager.runNextScene();
    });

    this.sceneManager.renderer.xr.addEventListener('sessionend', () => {
      console.log('VR Session Ended');
      window.location.reload();
    });

    // Load initial resources
    this.loadInitialResources();
  }

  private async loadInitialResources(): Promise<void> {
    try {
      // Load environment
      await this.sceneManager.loadEnvironment();

      // Load sounds (non-blocking)
      this.audioManager.loadAllSounds().catch((e) => {
        console.warn('Failed to load some audio files:', e);
      });

      // Hide loading screen
      this.uiManager.hideLoading();
      this.uiManager.showBackgroundImage();
      this.uiManager.showInstructions();
    } catch (error) {
      console.error('Error loading initial resources:', error);
      alert('Error loading environment. Please refresh the page.');
    }
  }

  private onInitialClick(): void {
    if (this.experienceStarted) return;
    this.experienceStarted = true;

    // Resume audio context
    const audioListener = this.cameraManager.getAudioListener();
    if (audioListener.context.state === 'suspended') {
      audioListener.context.resume();
    }

    // Start the sequence
    this.sequenceManager.runNextScene();
  }

  private setupEventListeners(): void {
    // Start button
    this.uiManager.onStartButtonClick(() => {
      this.sequenceManager.runNextScene();
    });

    // Toggle buttons
    this.uiManager.onToggleButtonClick((index) => {
      this.sequenceManager.handleVariantClick(index);
    });

    // Keyboard events for physics
    document.addEventListener('keydown', (e) => {
      if (!this.isVR && this.cameraManager.pointerLockControls.isLocked) {
        this.physicsManager.handleKeyDown(e);
      }

      // Fullscreen toggle
      if (e.code === 'KeyF') {
        this.uiManager.toggleFullscreen();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (!this.isVR && this.cameraManager.pointerLockControls.isLocked) {
        this.physicsManager.handleKeyUp(e);
      }
    });

    // Pointer lock events
    this.cameraManager.pointerLockControls.addEventListener('lock', () => {
      console.log('Pointer locked');
      this.uiManager.hideInstructions();
    });

    this.cameraManager.pointerLockControls.addEventListener('unlock', () => {
      console.log('Pointer unlocked');
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.cameraManager.handleResize();
      this.sceneManager.handleResize();
      
      // Update composer with resized camera
      this.sceneManager.setupComposerWithCamera(this.cameraManager.getActiveCamera());
    });
  }

  private animate(): void {
    const delta = this.sceneManager.getDelta();

    // Update controls
    this.cameraManager.update(delta);

    // Update physics if in scene 5 (walk-through)
    if (this.sequenceManager.getCurrentScene() === 5) {
      if (!this.isVR && this.cameraManager.pointerLockControls.isLocked) {
        this.physicsManager.updatePlayerDesktop(
          delta,
          this.cameraManager.pointerLockControls,
          this.modelLoader.getColliderMeshes()
        );
      }

      if (this.isVR && this.sceneManager.renderer.xr.isPresenting) {
        this.physicsManager.updatePlayerVR(
          delta,
          this.cameraManager.playerRig,
          this.cameraManager.getActiveCamera(),
          this.modelLoader.getColliderMeshes(),
          this.vrControllers
        );
      }
    }

    // Update animations
    this.modelLoader.updateAnimations(delta);

    // Update SSAO pass enabled state based on camera type
    const camera = this.cameraManager.getActiveCamera();
    if (camera instanceof THREE.OrthographicCamera) {
      this.sceneManager.ssaoPass.enabled = false;
    } else {
      this.sceneManager.ssaoPass.enabled = true;
    }

    // Render
    this.sceneManager.render(this.cameraManager.getActiveCamera());
  }

  dispose(): void {
    this.sceneManager.dispose();
    this.modelLoader.dispose();
    this.audioManager.dispose();
  }
}
