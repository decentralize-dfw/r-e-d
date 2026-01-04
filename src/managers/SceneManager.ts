/**
 * Scene Manager - Handles Three.js scene setup and rendering
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { APP_CONFIG } from '@/config/app.config';

export class SceneManager {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  ssaoPass: SSAOPass;
  pmremGenerator: THREE.PMREMGenerator;
  clock: THREE.Clock;

  constructor() {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    
    // Initialize renderer
    this.renderer = this.createRenderer();
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    
    // Initialize composer (will be updated with camera later)
    this.composer = new EffectComposer(this.renderer);
    this.bloomPass = this.createBloomPass();
    this.ssaoPass = this.createSSAOPass();
    
    // Setup lighting
    this.setupLighting();
  }

  private createRenderer(): THREE.WebGLRenderer {
    const config = APP_CONFIG.rendering;
    const renderer = new THREE.WebGLRenderer({ antialias: config.antialias });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = config.toneMappingExposure;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    
    document.body.appendChild(renderer.domElement);
    
    return renderer;
  }

  private createBloomPass(): UnrealBloomPass {
    const bloom = APP_CONFIG.rendering.bloom;
    return new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloom.strength,
      bloom.radius,
      bloom.threshold
    );
  }

  private createSSAOPass(): SSAOPass {
    const ssao = APP_CONFIG.rendering.ssao;
    // Will be initialized with camera later
    const pass = new SSAOPass(
      this.scene,
      new THREE.PerspectiveCamera(), // Temporary camera
      window.innerWidth,
      window.innerHeight
    );
    pass.kernelRadius = ssao.kernelRadius;
    pass.minDistance = ssao.minDistance;
    pass.maxDistance = ssao.maxDistance;
    return pass;
  }

  setupComposerWithCamera(camera: THREE.Camera): void {
    // Clear existing passes
    this.composer.passes = [];
    
    // Add new passes with correct camera
    this.composer.addPass(new RenderPass(this.scene, camera));
    
    // Update SSAO with new camera
    this.ssaoPass = new SSAOPass(this.scene, camera, window.innerWidth, window.innerHeight);
    this.ssaoPass.kernelRadius = APP_CONFIG.rendering.ssao.kernelRadius;
    this.ssaoPass.minDistance = APP_CONFIG.rendering.ssao.minDistance;
    this.ssaoPass.maxDistance = APP_CONFIG.rendering.ssao.maxDistance;
    this.composer.addPass(this.ssaoPass);
    
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
  }

  private setupLighting(): void {
    const lighting = APP_CONFIG.lighting;
    
    // Hemisphere Light
    const hemi = new THREE.HemisphereLight(
      lighting.hemisphere.skyColor,
      lighting.hemisphere.groundColor,
      lighting.hemisphere.intensity
    );
    hemi.position.set(0, 20, 0);
    this.scene.add(hemi);
    
    // Directional Light (Sun)
    const sun = new THREE.DirectionalLight(
      lighting.directional.color,
      lighting.directional.intensity
    );
    sun.position.set(
      lighting.directional.position.x,
      lighting.directional.position.y,
      lighting.directional.position.z
    );
    sun.castShadow = true;
    sun.shadow.mapSize.set(APP_CONFIG.rendering.shadowMapSize, APP_CONFIG.rendering.shadowMapSize);
    
    const shadowCam = lighting.directional.shadowCamera;
    sun.shadow.camera.near = shadowCam.near;
    sun.shadow.camera.far = shadowCam.far;
    sun.shadow.camera.left = shadowCam.left;
    sun.shadow.camera.right = shadowCam.right;
    sun.shadow.camera.top = shadowCam.top;
    sun.shadow.camera.bottom = shadowCam.bottom;
    sun.shadow.bias = lighting.directional.shadowBias;
    sun.shadow.normalBias = lighting.directional.shadowNormalBias;
    
    this.scene.add(sun);
  }

  async loadEnvironment(): Promise<void> {
    const { RGBELoader } = await import('three/addons/loaders/RGBELoader.js');
    
    return new Promise((resolve, reject) => {
      const hdriURL = APP_CONFIG.assets.hdri;
      
      new RGBELoader().load(
        hdriURL,
        (texture: THREE.Texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          this.scene.background = texture;
          this.scene.environment = this.pmremGenerator.fromEquirectangular(texture).texture;
          this.pmremGenerator.dispose();
          texture.dispose();
          (this.scene as any).environmentIntensity = APP_CONFIG.lighting.environmentIntensity;
          resolve();
        },
        undefined,
        (error: unknown) => {
          console.error('Error loading environment:', error);
          reject(error);
        }
      );
    });
  }

  handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    
    // Update bloom pass
    this.bloomPass.setSize(width, height);
  }

  render(camera: THREE.Camera): void {
    if (this.renderer.xr.isPresenting) {
      this.renderer.render(this.scene, camera);
    } else {
      this.composer.render();
    }
  }

  getDelta(): number {
    return this.clock.getDelta();
  }

  dispose(): void {
    this.renderer.dispose();
    this.composer.dispose();
    this.pmremGenerator.dispose();
  }
}
