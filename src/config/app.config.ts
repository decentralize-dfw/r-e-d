/**
 * Application Configuration
 * Central configuration for the C2W2 Virtual Runway Premium Edition
 */

export const APP_CONFIG = {
  title: 'C2W2 VIRTUAL RUNWAY BY DFW',
  version: '1.0.0-premium',
  
  // Asset URLs
  assets: {
    hdri: 'https://raw.githubusercontent.com/decentralize-dfw/vea_001/main/RealismHDRI-_equirectangular-jpg_VR360_neon_drenched_skyscrapers_1656103290_10361044.hdr',
    backgroundImage: 'https://raw.githubusercontent.com/decentralize-dfw/vea_001/main/VEADEMO1.jpg',
    
    models: [
      'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2city-opt-v2.glb', // 0: City
      'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2city-ghost.glb', // 1: Ghost
      'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2city-metal-v1.glb', // 2: Metal
      'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2city-whitefacade-v3.glb', // 3: White Facade
      'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2kopuk-normalfacade-opt-v5.glb', // 4: Kopuk
      'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2-sehirici-apartmanici-opt-v6.glb', // 5: Interior City
      'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/DEMO2interior-soloapartement-opt-v4.glb', // 6: Interior
      'https://raw.githubusercontent.com/decentralize-dfw/vea-randomfiles/main/SCENE5-COLLDERd.glb', // 7: Collider
    ],
    
    sounds: [
      null, // 0
      null, // 1
      null, // 2
      null, // 3
      null, // 4
      null, // 5
    ],
  },
  
  // Rendering Settings
  rendering: {
    antialias: true,
    shadowMapSize: 2048,
    toneMapping: 'ACESFilmic',
    toneMappingExposure: 1.0,
    physicallyCorrectLights: true,
    
    // Post-processing
    bloom: {
      strength: 0.4,
      radius: 0.3,
      threshold: 0.88,
    },
    
    ssao: {
      kernelRadius: 0.8,
      minDistance: 0.001,
      maxDistance: 0.05,
    },
  },
  
  // Camera Settings
  camera: {
    perspective: {
      fov: 75,
      near: 0.1,
      far: 1000,
    },
    
    orthographic: {
      frustumSize: 40,
      near: 0.1,
      far: 1000,
    },
  },
  
  // Lighting
  lighting: {
    hemisphere: {
      skyColor: 0xffffff,
      groundColor: 0x444444,
      intensity: 0.5,
    },
    
    directional: {
      color: 0xffffff,
      intensity: 3.6,
      position: { x: 12, y: 24, z: 12 },
      shadowCamera: {
        near: 0.5,
        far: 160,
        left: -55,
        right: 55,
        top: 55,
        bottom: -55,
      },
      shadowBias: -0.0001,
      shadowNormalBias: 0.025,
    },
    
    environmentIntensity: 0.7,
  },
  
  // Player Physics
  physics: {
    playerHeight: 1.6,
    playerRadius: 0.4,
    baseMoveSpeed: 20,
    sprintMultiplier: 4,
    jumpVelocity: 6,
    gravity: -20,
    friction: 10.0,
  },
  
  // VR Settings
  vr: {
    moveSpeed: 80.0,
    turnSpeed: 2.0,
    sprintThreshold: 0.5,
  },
  
  // Scene Definitions
  scenes: {
    0: {
      name: 'Pre-Start',
      description: 'Auto-rotate scene',
      models: [0, 4], // City + Kopuk
      cameraType: 'orthographic',
      controls: 'orbit',
      autoRotate: true,
      autoRotateSpeed: 1.0,
      enableUserRotation: false,
      enableZoom: false,
      enablePan: false,
      cameraPosition: { x: 0, y: 20, z: 15 },
      cameraLookAt: { x: 0, y: 1, z: 0 },
    },
    
    1: {
      name: 'Concept & Context',
      description: 'Conceptual toggles',
      models: [0, 4], // City + Kopuk (reuse from scene 0)
      cameraType: 'orthographic',
      controls: 'orbit',
      autoRotate: true,
      autoRotateSpeed: 1.0,
      enableUserRotation: true,
      enableZoom: true,
      enablePan: false,
      cameraPosition: { x: 0, y: 30, z: 15 },
      cameraLookAt: { x: 0, y: 4, z: 0 },
      buttons: [
        { name: 'Surrounding', id: 'surrounding' },
        { name: 'Transportation', id: 'transportation' },
        { name: 'Units', id: 'units' },
      ],
    },
    
    2: {
      name: 'Design Options',
      description: 'A/B model comparison',
      models: [0, 3, 2, 4], // All 4 models for toggling
      cameraType: 'orthographic',
      controls: 'orbit',
      autoRotate: true,
      autoRotateSpeed: 1.0,
      enableUserRotation: true,
      enableZoom: true,
      enablePan: false,
      cameraPosition: { x: 0, y: 30, z: 15 },
      cameraLookAt: { x: 0, y: 4, z: 0 },
      buttons: [
        { name: 'Option 1 (M1+M4)', id: 'view1' },
        { name: 'Option 2 (M3+M5)', id: 'view2' },
      ],
    },
    
    3: {
      name: 'Structural View',
      description: 'Orbit interior structure',
      models: [2, 5], // Ghost + Interior section
      cameraType: 'orthographic',
      controls: 'orbit',
      autoRotate: false,
      enableUserRotation: true,
      enableZoom: true,
      enablePan: false,
      cameraPosition: { x: 15, y: 8, z: -15 },
      cameraLookAt: { x: 0, y: 4, z: 0 },
    },
    
    4: {
      name: 'Interior Tour',
      description: 'Static camera positions',
      models: [6], // Interior model
      cameraType: 'perspective',
      controls: 'orbit',
      autoRotate: false,
      enableUserRotation: true,
      enableZoom: true,
      enablePan: false,
      buttons: [
        { name: 'Salon', id: 'cam1' },
        { name: 'Bathroom', id: 'cam2' },
        { name: 'Bedroom 1', id: 'cam3' },
        { name: 'Bedroom 1 WC', id: 'cam4' },
        { name: 'Bedroom 2', id: 'cam5' },
        { name: 'Bedroom 2 WC', id: 'cam6' },
      ],
      cameraPositions: [
        { pos: { x: 1, y: 1.6, z: 1.6 }, lookAt: { x: 1, y: 1.6, z: 1.5 }, fov: 80 },
        { pos: { x: -2, y: 1.6, z: 3.1 }, lookAt: { x: -2.1, y: 1.6, z: 3.2 }, fov: 80 },
        { pos: { x: -2, y: 1.6, z: 0 }, lookAt: { x: -2.1, y: 1.6, z: -0.1 }, fov: 80 },
        { pos: { x: -2, y: 1.6, z: 2.1 }, lookAt: { x: -2.1, y: 1.6, z: 2.2 }, fov: 80 },
        { pos: { x: 4.4, y: 1.6, z: 0 }, lookAt: { x: 4.5, y: 1.6, z: -0.1 }, fov: 80 },
        { pos: { x: 3.9, y: 1.6, z: 3.7 }, lookAt: { x: 4.0, y: 1.6, z: 3.8 }, fov: 80 },
      ],
    },
    
    5: {
      name: 'Walk-through',
      description: 'First-person exploration',
      models: [6, 7], // Interior + Collider
      cameraType: 'perspective',
      controls: 'pointerlock',
      cameraPosition: { x: 1.4, y: 1.6, z: -0.6 },
    },
  },
  
  // UI Theme
  theme: {
    colors: {
      foreground: '#fff',
      background: '#000',
      muted: '#9aa0a6',
      accent: '#e5e5e5',
      panel: 'rgba(0, 0, 0, .55)',
    },
    
    panelBlur: '8px',
    
    borderRadius: {
      small: '4px',
      medium: '12px',
    },
  },
};

export type AppConfig = typeof APP_CONFIG;
