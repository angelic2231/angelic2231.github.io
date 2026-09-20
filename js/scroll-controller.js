/**
 * ScrollController - Lenis-inspired Continuous Momentum Scroller with Spatial Parallax
 * 
 * Features:
 * - Fluid continuous momentum scrolling using lerp physics on mouse wheels
 * - 100% native 120Hz touch momentum on mobile / iOS devices
 * - Real-time scroll progress driven spatial 3D card translation, scaling, and Gaussian depth blur
 * - Bi-directional smooth navigation for side indicators, action buttons, and keyboard controls
 */
export class ScrollController {
  constructor(viewport) {
    this.viewport = viewport;
    this.cardIntro = document.getElementById('card-intro');
    this.cardWhisper = document.getElementById('card-whisper');
    this.dots = [
      document.getElementById('dot-0'),
      document.getElementById('dot-1')
    ];
    this.btnToWhisper = document.getElementById('btn-to-whisper');
    this.btnToIntro = document.getElementById('btn-to-intro');

    this.targetScroll = this.viewport.scrollTop;
    this.currentScroll = this.viewport.scrollTop;
    this.isLerping = false;
    this.isTouch = false;
    this.rafId = null;

    this.bindEvents();
    this.updateSpatialCards();
  }

  updateSpatialCards() {
    const vh = this.viewport.clientHeight || window.innerHeight;
    const scrollY = this.viewport.scrollTop;
    const progress = Math.max(0, Math.min(1, scrollY / vh));

    // Card 1: Introduction (dissolves, scales down, and floats upward)
    if (this.cardIntro) {
      const introOpacity = Math.max(0, 1 - progress * 1.5);
      const introY = -progress * 90;
      const introScale = 1 - progress * 0.07;
      const introBlur = progress * 10;
      this.cardIntro.style.transform = `translate3d(0, ${introY}px, 0) scale(${introScale})`;
      this.cardIntro.style.opacity = introOpacity;
      this.cardIntro.style.filter = introBlur > 0.1 ? `blur(${introBlur}px)` : 'none';
      this.cardIntro.style.pointerEvents = progress > 0.5 ? 'none' : 'auto';
    }

    // Card 2: Whisper (rises from bottom, clarifies from depth blur, reveals Bloom glow)
    if (this.cardWhisper) {
      const whisperOpacity = Math.max(0, Math.min(1, (progress - 0.15) / 0.75));
      const whisperY = (1 - progress) * 90;
      const whisperScale = 0.93 + progress * 0.07;
      const whisperBlur = (1 - progress) * 10;
      this.cardWhisper.style.transform = `translate3d(0, ${whisperY}px, 0) scale(${whisperScale})`;
      this.cardWhisper.style.opacity = whisperOpacity;
      this.cardWhisper.style.filter = whisperBlur > 0.1 ? `blur(${whisperBlur}px)` : 'none';
      this.cardWhisper.style.pointerEvents = progress < 0.5 ? 'none' : 'auto';
    }

    // Side navigation active dot
    const activeIndex = progress > 0.5 ? 1 : 0;
    if (this.dots[0]) this.dots[0].classList.toggle('active', activeIndex === 0);
    if (this.dots[1]) this.dots[1].classList.toggle('active', activeIndex === 1);
  }

  lerpLoop() {
    if (!this.isLerping) return;

    const diff = this.targetScroll - this.currentScroll;
    if (Math.abs(diff) > 0.5) {
      this.currentScroll += diff * 0.09; // Luxurious smooth damping
      this.viewport.scrollTop = this.currentScroll;
      this.updateSpatialCards();
      this.rafId = requestAnimationFrame(() => this.lerpLoop());
    } else {
      this.currentScroll = this.targetScroll;
      this.viewport.scrollTop = this.currentScroll;
      this.updateSpatialCards();
      this.isLerping = false;
    }
  }

  smoothScrollTo(y) {
    const maxScroll = this.viewport.scrollHeight - this.viewport.clientHeight;
    this.targetScroll = Math.max(0, Math.min(maxScroll, y));

    if (!this.isLerping) {
      this.isLerping = true;
      this.currentScroll = this.viewport.scrollTop;
      this.rafId = requestAnimationFrame(() => this.lerpLoop());
    }
  }

  bindEvents() {
    // Touch screens: 100% native smooth momentum physics
    this.viewport.addEventListener('touchstart', () => {
      this.isTouch = true;
      this.isLerping = false;
      this.targetScroll = this.currentScroll = this.viewport.scrollTop;
    }, { passive: true });

    this.viewport.addEventListener('scroll', () => {
      if (!this.isLerping) {
        this.targetScroll = this.currentScroll = this.viewport.scrollTop;
        this.updateSpatialCards();
      }
    }, { passive: true });

    // Desktop Mouse Wheel: Lenis-style momentum
    this.viewport.addEventListener('wheel', (e) => {
      if (this.isTouch) this.isTouch = false;

      // Allow natural scroll inside textarea
      if (e.target && e.target.closest && e.target.closest('.form-textarea')) {
        const ta = e.target.closest('.form-textarea');
        if (ta.scrollHeight > ta.clientHeight) return;
      }

      // Preserve trackpad horizontal swipes
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const maxScroll = this.viewport.scrollHeight - this.viewport.clientHeight;
      this.targetScroll = Math.max(0, Math.min(maxScroll, this.targetScroll + e.deltaY * 0.85));

      if (!this.isLerping) {
        this.isLerping = true;
        this.currentScroll = this.viewport.scrollTop;
        this.rafId = requestAnimationFrame(() => this.lerpLoop());
      }
      e.preventDefault();
    }, { passive: false });

    // Navigation Dots & Buttons
    if (this.dots[0]) {
      this.dots[0].addEventListener('click', () => this.smoothScrollTo(0));
    }
    if (this.dots[1]) {
      this.dots[1].addEventListener('click', () => this.smoothScrollTo(this.viewport.clientHeight));
    }
    if (this.btnToWhisper) {
      this.btnToWhisper.addEventListener('click', (e) => {
        e.preventDefault();
        this.smoothScrollTo(this.viewport.clientHeight);
      });
    }
    if (this.btnToIntro) {
      this.btnToIntro.addEventListener('click', (e) => {
        e.preventDefault();
        this.smoothScrollTo(0);
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        this.smoothScrollTo(this.viewport.clientHeight);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        this.smoothScrollTo(0);
      }
    });
  }
}
