/**
 * ShaderEngine - Highly Optimized WebGL Chromatic Fluid Background
 * 
 * Performance Optimizations:
 * - 4-octave FBM with compile-time constant rotation matrix (zero trigonometric calculations inside loop)
 * - Single-pass 3-channel dispersion (eliminated redundant 4th & 5th scene evaluations, saving 40% per-pixel operations)
 * - Intelligent DPR capping (1.25 on mobile, 1.5 on desktop) reducing fragment shader load by over 50%
 * - Automatic pause when tab is hidden (Page Visibility API) to conserve battery and GPU resources
 */
export class ShaderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.resolutionLocation = null;
    this.timeLocation = null;
    this.mouseLocation = null;
    this.startTime = performance.now();
    this.animationFrameId = null;
    this.isRunning = false;

    this.vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    this.fsSource = `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
      #else
      precision mediump float;
      #endif

      uniform vec3 iResolution;
      uniform float iTime;
      uniform vec4 iMouse;

      // Precomputed rotation matrix for angle 0.53 radians (eliminates sin/cos in loop)
      const mat2 ROT = mat2(0.8628137, -0.5055248, 0.5055248, 0.8628137);

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      // Optimized 4-octave FBM with constant matrix multiplication
      float fbm(vec2 p) {
        float v = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
          v += amp * noise(p);
          p = ROT * p * 2.03;
          amp *= 0.5;
        }
        return v;
      }

      vec3 scene(vec2 uv, float t) {
        vec2 q = vec2(
          fbm(uv * 1.6 + vec2(0.0, 0.15 * t)),
          fbm(uv * 1.6 + vec2(5.2, 1.3) - 0.10 * t)
        );

        vec2 r = vec2(
          fbm(uv * 1.6 + 3.5 * q + vec2(1.7, 9.2) + 0.12 * t),
          fbm(uv * 1.6 + 3.5 * q + vec2(8.3, 2.8) - 0.09 * t)
        );

        float f = fbm(uv * 1.6 + 3.0 * r);

        vec3 col = mix(
          vec3(0.015, 0.025, 0.075),
          vec3(0.10, 0.55, 0.95),
          clamp(f * f * 4.0, 0.0, 1.0)
        );

        col = mix(col, vec3(0.95, 0.30, 0.62), clamp(length(q), 0.0, 1.0));
        col = mix(col, vec3(1.00, 0.88, 0.35), clamp(r.x * r.x, 0.0, 1.0));

        float phase = 11.0 * length(uv - 0.35 * vec2(cos(0.6 * t), sin(0.6 * t))) - 3.5 * f;
        col += 0.14 * sin(phase);
        col += 0.02 * (hash21(uv * 700.0 + t) - 0.5);

        return max(col, 0.0);
      }

      // Optimized Chromatic Dispersion (3 passes instead of 5)
      vec3 chromatic(vec2 uv, vec2 lensCenter, float t) {
        vec2 d = uv - lensCenter;
        float r2 = dot(d, d);
        vec2 cuv = lensCenter + d * (1.0 + 0.18 * r2);
        float ca = (0.006 + 0.055 * r2) * (1.0 + 0.35 * sin(0.7 * t));
        vec2 axis = normalize(d + 1e-5);

        vec3 col;
        col.r = scene(cuv + axis * ca * 1.6, t).r;
        col.g = scene(cuv, t).g;
        col.b = scene(cuv - axis * ca * 1.6, t).b;

        // Soft fringe blend without requiring expensive additional scene evaluations
        col.r = mix(col.r, col.g, 0.08);
        col.b = mix(col.b, col.g, 0.08);

        return col;
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        float t = iTime;
        float aspect = iResolution.x / iResolution.y;
        float refDim = aspect < 1.0 ? mix(iResolution.x, iResolution.y, 0.3) : iResolution.y;
        vec2 uv = (2.0 * fragCoord - iResolution.xy) / refDim;

        vec2 lensCenter = 0.22 * vec2(cos(0.23 * t), sin(0.31 * t));
        vec3 col = chromatic(uv, lensCenter, t);

        float vigRadius = aspect < 1.0 ? 2.1 : 1.7;
        float vig = smoothstep(vigRadius, 0.25, length(uv - lensCenter));
        col *= 0.35 + 0.65 * vig;

        col = col / (1.0 + col);
        col = pow(col, vec3(0.4545));
        col += (hash21(fragCoord + fract(t)) - 0.5) / 255.0;

        fragColor = vec4(col, 1.0);
      }

      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    this.init();
    this.bindEvents();
    this.start();
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  init() {
    this.gl = this.canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance'
    }) || this.canvas.getContext('experimental-webgl');

    if (!this.gl) {
      document.body.style.background = 'radial-gradient(ellipse at center, #1b1535 0%, #030308 100%)';
      return false;
    }

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.vsSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fsSource);
    if (!vertexShader || !fragmentShader) return false;

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error(this.gl.getProgramInfoLog(this.program));
      return false;
    }

    this.gl.useProgram(this.program);

    // Full-screen triangle
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.resolutionLocation = this.gl.getUniformLocation(this.program, 'iResolution');
    this.timeLocation = this.gl.getUniformLocation(this.program, 'iTime');
    this.mouseLocation = this.gl.getUniformLocation(this.program, 'iMouse');

    this.resize();
    return true;
  }

  resize() {
    if (!this.gl) return;
    // Capped DPR prevents huge GPU load on Retina and 4K displays
    const maxDpr = window.innerWidth < 768 ? 1.25 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    const displayWidth = Math.floor((window.innerWidth || document.documentElement.clientWidth) * dpr);
    const displayHeight = Math.floor((window.innerHeight || document.documentElement.clientHeight) * dpr);

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, displayWidth, displayHeight);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.resize(), 100);
      setTimeout(() => this.resize(), 300);
    }, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.resize(), { passive: true });
    }

    // Page Visibility optimization: pause rendering when tab is inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.stop();
    }, false);

    this.canvas.addEventListener('webglcontextrestored', () => {
      this.init();
      this.start();
    }, false);
  }

  render(now) {
    if (!this.isRunning) return;

    if (this.gl && this.program) {
      const time = (now - this.startTime) * 0.001;
      this.gl.uniform3f(this.resolutionLocation, this.canvas.width, this.canvas.height, 1.0);
      this.gl.uniform1f(this.timeLocation, time);
      this.gl.uniform4f(this.mouseLocation, 0.0, 0.0, 0.0, 0.0);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }

    this.animationFrameId = requestAnimationFrame((t) => this.render(t));
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animationFrameId = requestAnimationFrame((t) => this.render(t));
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
