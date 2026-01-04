/**
 * Model Loader - Handles loading and managing 3D models
 */

import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import type { LoadedModel, ModelConfig } from '@/types';

export class ModelLoader {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private loadedModels: LoadedModel[] = [];
  private colliderMeshes: THREE.Mesh[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    // Setup DRACO loader
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });
    
    // Setup GLTF loader
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }

  async loadModel(url: string, config: ModelConfig = {}): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf: GLTF) => {
          const modelScene = gltf.scene;
          
          // Apply transformations
          if (config.pos) {
            modelScene.position.set(config.pos.x, config.pos.y, config.pos.z);
          }
          if (config.rot) {
            modelScene.rotation.set(config.rot.x, config.rot.y, config.rot.z);
          }
          if (config.scale) {
            modelScene.scale.set(config.scale.x, config.scale.y, config.scale.z);
          }
          
          // Set visibility
          modelScene.visible = config.visible !== undefined ? config.visible : true;
          
          // Store ID for later reference
          if (config.id) {
            modelScene.userData.id = config.id;
          }
          
          // Setup animations if present
          let mixer: THREE.AnimationMixer | null = null;
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(modelScene);
            gltf.animations.forEach((clip: THREE.AnimationClip) => {
              mixer!.clipAction(clip).play();
            });
          }
          
          // Configure materials and shadows
          modelScene.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              if (child.material) {
                const material = child.material as THREE.MeshStandardMaterial;
                if (material.emissive) {
                  material.emissiveIntensity = 1;
                }
              }
            }
          });
          
          // Add to scene
          this.scene.add(modelScene);
          
          // Store reference
          const loadedModel: LoadedModel = { scene: modelScene, mixer };
          this.loadedModels.push(loadedModel);
          
          console.log(`Model loaded: ${url}`);
          resolve(loadedModel);
        },
        undefined,
        (error: unknown) => {
          console.error(`Error loading model ${url}:`, error);
          reject(error);
        }
      );
    });
  }

  async loadColliderModel(url: string): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf: GLTF) => {
          const modelScene = gltf.scene;
          modelScene.visible = false; // Invisible
          
          modelScene.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              // Make invisible with double-sided collision
              child.material = new THREE.MeshBasicMaterial({
                visible: false,
                side: THREE.DoubleSide,
              });
              this.colliderMeshes.push(child);
            }
          });
          
          this.scene.add(modelScene);
          
          const loadedModel: LoadedModel = { scene: modelScene, mixer: null };
          this.loadedModels.push(loadedModel);
          
          console.log(`Collider model loaded: ${url}`);
          resolve(loadedModel);
        },
        undefined,
        (error: unknown) => {
          console.error(`Error loading collider model ${url}:`, error);
          reject(error);
        }
      );
    });
  }

  setModelVisibility(id: string, visible: boolean): void {
    const model = this.loadedModels.find((m) => m.scene.userData.id === id);
    if (model) {
      model.scene.visible = visible;
    } else {
      console.warn(`Model with id "${id}" not found for visibility toggle.`);
    }
  }

  async unloadAll(): Promise<void> {
    console.log(`Unloading ${this.loadedModels.length} models.`);
    
    this.loadedModels.forEach((modelEntry) => {
      if (modelEntry.scene) {
        // Stop animations
        if (modelEntry.mixer) {
          modelEntry.mixer.stopAllAction();
        }
        
        // Remove from scene
        this.scene.remove(modelEntry.scene);
        
        // Dispose geometry and materials
        modelEntry.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  if (mat) mat.dispose();
                });
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    });
    
    // Clear arrays
    this.loadedModels = [];
    this.colliderMeshes = [];
    
    return Promise.resolve();
  }

  updateAnimations(delta: number): void {
    this.loadedModels.forEach((modelEntry) => {
      if (modelEntry.mixer) {
        modelEntry.mixer.update(delta);
      }
    });
  }

  getColliderMeshes(): THREE.Mesh[] {
    return this.colliderMeshes;
  }

  getLoadedModels(): LoadedModel[] {
    return this.loadedModels;
  }

  dispose(): void {
    this.unloadAll();
    this.dracoLoader.dispose();
  }
}
