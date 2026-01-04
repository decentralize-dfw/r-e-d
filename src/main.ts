/**
 * Main Entry Point for C2W2 Virtual Runway Premium Edition
 */

import '@/styles/main.css';
import { Application } from '@/core/Application';
import * as THREE from 'three';

// Make THREE available globally for debugging
(window as any).THREE = THREE;

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  try {
    const app = new Application();
    
    // Store app instance globally for debugging
    (window as any).app = app;
    
    console.log('C2W2 Virtual Runway Premium Edition initialized');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    alert('Failed to initialize the application. Please refresh the page.');
  }
}
