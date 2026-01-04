/**
 * Sequence Manager - Orchestrates scene transitions and sequences
 */

import { APP_CONFIG } from '@/config/app.config';
import type { ModelLoader } from './ModelLoader';
import type { CameraManager } from './CameraManager';
import type { AudioManager } from './AudioManager';
import type { UIManager } from './UIManager';
import type { SceneConfig } from '@/types';

export class SequenceManager {
  private currentScene: number = -1;
  private modelLoader: ModelLoader;
  private cameraManager: CameraManager;
  private audioManager: AudioManager;
  private uiManager: UIManager;
  private isVR: boolean;

  constructor(
    modelLoader: ModelLoader,
    cameraManager: CameraManager,
    audioManager: AudioManager,
    uiManager: UIManager,
    isVR: boolean
  ) {
    this.modelLoader = modelLoader;
    this.cameraManager = cameraManager;
    this.audioManager = audioManager;
    this.uiManager = uiManager;
    this.isVR = isVR;
  }

  async runNextScene(): Promise<void> {
    this.currentScene++;
    console.log(`--- Running Sequence Scene: ${this.currentScene} ---`);

    // Show loading indicators
    this.uiManager.showSceneLoading();
    this.uiManager.showBackgroundImage();
    this.uiManager.showInfoButtons(false);
    this.uiManager.updateHtmlPanels(null, null);
    this.uiManager.hideDescription();
    this.audioManager.stopAll();

    try {
      const sceneConfig = APP_CONFIG.scenes[this.currentScene];

      if (!sceneConfig) {
        // Restart sequence
        if (this.currentScene === 6) {
          window.location.reload();
        }
        return;
      }

      await this.loadScene(sceneConfig);
    } catch (error) {
      console.error(`Error during sequence scene ${this.currentScene}:`, error);
      throw error;
    } finally {
      this.uiManager.hideSceneLoading();
      this.uiManager.hideBackgroundImage();
      this.uiManager.showInfoButtons(true);

      if (this.isVR) {
        this.uiManager.hideFullscreenButton();
      }
    }
  }

  private async loadScene(config: SceneConfig): Promise<void> {
    switch (this.currentScene) {
      case 0:
        await this.loadScene0(config);
        break;
      case 1:
        await this.loadScene1(config);
        break;
      case 2:
        await this.loadScene2(config);
        break;
      case 3:
        await this.loadScene3(config);
        break;
      case 4:
        await this.loadScene4(config);
        break;
      case 5:
        await this.loadScene5(config);
        break;
    }
  }

  private async loadScene0(config: SceneConfig): Promise<void> {
    this.uiManager.hideInstructions();
    this.uiManager.showStartButton('Start');

    await this.modelLoader.unloadAll();

    // Load models
    const modelUrls = APP_CONFIG.assets.models;
    await Promise.all(
      config.models.map((modelIndex) =>
        this.modelLoader.loadModel(modelUrls[modelIndex], { visible: true })
      )
    );

    // Setup camera
    this.cameraManager.setupCamera(
      {
        type: 'orbit',
        cameraType: config.cameraType,
        pos: config.cameraPosition,
        lookAt: config.cameraLookAt,
        autoRotate: config.autoRotate,
        autoRotateSpeed: config.autoRotateSpeed,
        enablePan: config.enablePan,
        enableZoom: config.enableZoom,
        enableRotate: config.enableUserRotation,
      },
      this.isVR
    );

    this.uiManager.updateHtmlPanels('html_scene0_left', 'html_scene0_right');
    this.audioManager.playAudio(0, true);
  }

  private async loadScene1(config: SceneConfig): Promise<void> {
    this.uiManager.showStartButton('Next Scene');

    // Models already loaded, just update camera
    this.cameraManager.setupCamera(
      {
        type: 'orbit',
        cameraType: config.cameraType,
        pos: config.cameraPosition,
        lookAt: config.cameraLookAt,
        autoRotate: config.autoRotate,
        autoRotateSpeed: config.autoRotateSpeed,
        enablePan: config.enablePan,
        enableZoom: config.enableZoom,
        enableRotate: config.enableUserRotation,
      },
      this.isVR
    );

    if (config.buttons) {
      this.uiManager.updateToggleButtons(config.buttons);
    }

    this.uiManager.updateHtmlPanels('html_scene1_opt1_left', 'html_scene1_opt1_right');
    this.audioManager.playAudio(1, true);
  }

  private async loadScene2(config: SceneConfig): Promise<void> {
    await this.modelLoader.unloadAll();

    const modelUrls = APP_CONFIG.assets.models;
    await Promise.all([
      this.modelLoader.loadModel(modelUrls[0], { id: 'm1', visible: false }),
      this.modelLoader.loadModel(modelUrls[3], { id: 'm4', visible: false }),
      this.modelLoader.loadModel(modelUrls[2], { id: 'm3', visible: false }),
      this.modelLoader.loadModel(modelUrls[4], { id: 'm5', visible: false }),
    ]);

    if (config.buttons) {
      this.uiManager.updateToggleButtons(config.buttons);
    }

    this.cameraManager.setupCamera(
      {
        type: 'orbit',
        cameraType: config.cameraType,
        pos: config.cameraPosition,
        lookAt: config.cameraLookAt,
        autoRotate: config.autoRotate,
        autoRotateSpeed: config.autoRotateSpeed,
        enablePan: config.enablePan,
        enableZoom: config.enableZoom,
        enableRotate: config.enableUserRotation,
      },
      this.isVR
    );

    // Show default view (Option 1)
    this.handleVariantClick(0);
    this.audioManager.playAudio(2, true);
  }

  private async loadScene3(config: SceneConfig): Promise<void> {
    await this.modelLoader.unloadAll();

    const modelUrls = APP_CONFIG.assets.models;
    await Promise.all(
      config.models.map((modelIndex) =>
        this.modelLoader.loadModel(modelUrls[modelIndex], { visible: true })
      )
    );

    this.uiManager.updateToggleButtons(null);

    this.cameraManager.setupCamera(
      {
        type: 'orbit',
        cameraType: config.cameraType,
        pos: config.cameraPosition,
        lookAt: config.cameraLookAt,
        autoRotate: config.autoRotate,
        autoRotateSpeed: config.autoRotateSpeed,
        enablePan: config.enablePan,
        enableZoom: config.enableZoom,
        enableRotate: config.enableUserRotation,
      },
      this.isVR
    );

    this.uiManager.updateHtmlPanels('html_scene3_left', 'html_scene3_right');
    this.audioManager.playAudio(3, true);
  }

  private async loadScene4(config: SceneConfig): Promise<void> {
    await this.modelLoader.unloadAll();

    const modelUrls = APP_CONFIG.assets.models;
    await this.modelLoader.loadModel(modelUrls[6], { visible: true });

    if (config.buttons) {
      this.uiManager.updateToggleButtons(config.buttons);
    }

    // Go to first camera position by default
    this.handleVariantClick(0);
    this.audioManager.playAudio(4, true);
  }

  private async loadScene5(config: SceneConfig): Promise<void> {
    await this.modelLoader.unloadAll();

    const modelUrls = APP_CONFIG.assets.models;
    await Promise.all([
      this.modelLoader.loadModel(modelUrls[6], { visible: true }),
      this.modelLoader.loadColliderModel(modelUrls[7]),
    ]);

    this.uiManager.updateToggleButtons(null);
    this.uiManager.showStartButton('Restart');

    this.cameraManager.setupCamera(
      {
        type: 'pointerlock',
        pos: config.cameraPosition,
      },
      this.isVR
    );

    this.uiManager.updateHtmlPanels('html_scene5_left', 'html_scene5_right');
    this.audioManager.playAudio(5, true);
  }

  handleVariantClick(index: number): void {
    this.uiManager.selectToggleButton(index);

    const sceneConfig = APP_CONFIG.scenes[this.currentScene];
    const buttons = this.uiManager.getModelToggleButtons();

    switch (this.currentScene) {
      case 1: // Conceptual models
        if (index === 0)
          this.uiManager.updateHtmlPanels('html_scene1_opt1_left', 'html_scene1_opt1_right');
        else if (index === 1)
          this.uiManager.updateHtmlPanels('html_scene1_opt2_left', 'html_scene1_opt2_right');
        else if (index === 2)
          this.uiManager.updateHtmlPanels('html_scene1_opt3_left', 'html_scene1_opt3_right');

        this.uiManager.showDescription(`Info for ${buttons[index]?.textContent}`);
        break;

      case 2: // Scene 2 Views
        const showView1 = index === 0;
        this.modelLoader.setModelVisibility('m1', showView1);
        this.modelLoader.setModelVisibility('m4', showView1);
        this.modelLoader.setModelVisibility('m3', !showView1);
        this.modelLoader.setModelVisibility('m5', !showView1);

        if (index === 0)
          this.uiManager.updateHtmlPanels('html_scene2_opt1_left', 'html_scene2_opt1_right');
        else if (index === 1)
          this.uiManager.updateHtmlPanels('html_scene2_opt2_left', 'html_scene2_opt2_right');

        this.uiManager.showDescription(`Showing ${buttons[index]?.textContent}`);
        break;

      case 4: // Scene 4 Camera Positions
        if (sceneConfig.cameraPositions && index < sceneConfig.cameraPositions.length) {
          const camPos = sceneConfig.cameraPositions[index];
          this.cameraManager.setupCamera(
            {
              type: 'static_orbit',
              cameraType: 'perspective',
              pos: camPos.pos,
              lookAt: camPos.lookAt,
              fov: camPos.fov,
              autoRotate: false,
              enablePan: false,
              enableZoom: true,
              enableRotate: true,
            },
            this.isVR
          );

          // Update HTML panels for each camera
          const panelIds = [
            ['html_scene4_cam1_left', 'html_scene4_cam1_right'],
            ['html_scene4_cam2_left', 'html_scene4_cam2_right'],
            ['html_scene4_cam3_left', 'html_scene4_cam3_right'],
            ['html_scene4_cam4_left', 'html_scene4_cam4_right'],
            ['html_scene4_cam5_left', 'html_scene4_cam5_right'],
            ['html_scene4_cam6_left', 'html_scene4_cam6_right'],
          ];

          if (panelIds[index]) {
            this.uiManager.updateHtmlPanels(panelIds[index][0], panelIds[index][1]);
          }

          this.uiManager.showDescription(`Camera: ${buttons[index]?.textContent}`);
        }
        break;
    }
  }

  getCurrentScene(): number {
    return this.currentScene;
  }
}
