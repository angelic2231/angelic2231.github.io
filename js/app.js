/**
 * Main Application Entry Point
 * Coordinates the Shader Engine and the Morphing Whisper Modal.
 */
import { ShaderEngine } from './shader-engine.js';
import { MorphModal } from './morph-modal.js';

function initApp() {
  const canvas = document.getElementById('glcanvas');
  const morphCard = document.getElementById('morph-card');

  // 1. Initialize Highly-Optimized WebGL Shader Background
  if (canvas) {
    new ShaderEngine(canvas);
  }

  // 2. Initialize Morphing Button / Modal Controller
  if (morphCard) {
    new MorphModal(morphCard);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
