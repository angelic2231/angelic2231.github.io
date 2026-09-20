/**
 * Main Application Entry Point
 * Coordinates the Shader Engine and the Growing Whisper Panel.
 */
import { ShaderEngine } from './shader-engine.js';
import { MorphModal } from './morph-modal.js';

function initApp() {
  const canvas = document.getElementById('glcanvas');
  const panel = document.getElementById('whisper-panel');

  // 1. Initialize Highly-Optimized WebGL Shader Background
  if (canvas) {
    new ShaderEngine(canvas);
  }

  // 2. Initialize Growing Panel Controller
  if (panel) {
    new MorphModal(panel);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
