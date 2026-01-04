import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'three-addons': [
            'three/examples/jsm/loaders/GLTFLoader',
            'three/examples/jsm/loaders/DRACOLoader',
            'three/examples/jsm/loaders/RGBELoader',
          ],
          'three-controls': [
            'three/examples/jsm/controls/OrbitControls',
            'three/examples/jsm/controls/PointerLockControls',
          ],
          'three-postprocessing': [
            'three/examples/jsm/postprocessing/EffectComposer',
            'three/examples/jsm/postprocessing/RenderPass',
            'three/examples/jsm/postprocessing/UnrealBloomPass',
            'three/examples/jsm/postprocessing/SSAOPass',
            'three/examples/jsm/postprocessing/OutputPass',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['three'],
  },
  server: {
    port: 3000,
    open: true,
  },
});
