/**
 * Main Application Entry Point
 * Coordinates the Shader Engine, Scroll Controller, and Whisper Form.
 */
import { ShaderEngine } from './shader-engine.js';
import { ScrollController } from './scroll-controller.js';
import { WhisperForm } from './whisper-form.js';

function initApp() {
  const canvas = document.getElementById('glcanvas');
  const viewport = document.getElementById('viewport');
  const form = document.getElementById('whisper-form');

  // 1. Initialize Highly-Optimized WebGL Shader Background
  if (canvas) {
    new ShaderEngine(canvas);
  }

  // 2. Initialize Continuous Momentum Scroller & Spatial Parallax
  if (viewport) {
    new ScrollController(viewport);
  }

  // 3. Initialize Whisper Form Controller
  if (form) {
    new WhisperForm(form);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
