/**
 * MorphModal - Ultra-Smooth Fluid Morphing Button & Whisper Window Controller
 * 
 * Performance & Animation Architecture:
 * - Fluid dimensional interpolation between exact pixel bounds (190x54px <-> 420xHpx)
 * - Zero 'display: none' layout thrashing; uses GPU-accelerated opacity & transform cross-fading
 * - Offscreen clone measuring for exact target height without visual reflows
 * - Apple-grade cubic-bezier(0.16, 1, 0.3, 1) spring easing
 */
export class MorphModal {
  constructor(cardElement, accessKey = '8f2c9af3-1017-40b7-8ccd-9409fa5dcbfd') {
    this.card = cardElement;
    this.accessKey = accessKey;
    this.windowView = this.card.querySelector('.window-view');
    this.triggerView = this.card.querySelector('.trigger-view');
    this.closeBtn = this.card.querySelector('#close-btn');
    this.form = this.card.querySelector('#whisper-form');
    this.submitBtn = this.card.querySelector('#submit-btn');
    this.statusMsg = this.card.querySelector('#status-msg');
    this.nameInput = this.card.querySelector('#user-name');
    this.messageInput = this.card.querySelector('#user-message');

    this.isExpanded = false;
    this.isAnimating = false;

    this.collapsedWidth = 190;
    this.collapsedHeight = 54;
    this.collapsedRadius = 27;

    this.bindEvents();
  }

  getExpandedSize() {
    const targetWidth = Math.min(420, window.innerWidth - 36);

    // Measure exact natural height using a detached offscreen clone
    const clone = this.windowView.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.pointerEvents = 'none';
    clone.style.width = `${targetWidth}px`;
    clone.style.opacity = '1';
    clone.style.transform = 'none';
    document.body.appendChild(clone);

    const measuredHeight = clone.offsetHeight || 380;
    document.body.removeChild(clone);

    return { width: targetWidth, height: measuredHeight };
  }

  expand() {
    if (this.isExpanded || this.isAnimating) return;
    this.isExpanded = true;
    this.isAnimating = true;

    const { width, height } = this.getExpandedSize();

    // Lock starting dimensions
    this.card.style.width = `${this.collapsedWidth}px`;
    this.card.style.height = `${this.collapsedHeight}px`;
    this.card.style.borderRadius = `${this.collapsedRadius}px`;

    // Force layout flush so transition starts cleanly from exact initial state
    void this.card.offsetHeight;

    // Apply target dimensions for fluid spring expansion
    this.card.style.width = `${width}px`;
    this.card.style.height = `${height}px`;
    this.card.style.borderRadius = '28px';
    this.card.classList.add('expanded');

    setTimeout(() => {
      this.isAnimating = false;
      if (this.nameInput) this.nameInput.focus();
    }, 450);
  }

  collapse() {
    if (!this.isExpanded || this.isAnimating) return;
    this.isExpanded = false;
    this.isAnimating = true;

    // Smooth dimensional collapse back to pill button
    this.card.style.width = `${this.collapsedWidth}px`;
    this.card.style.height = `${this.collapsedHeight}px`;
    this.card.style.borderRadius = `${this.collapsedRadius}px`;
    this.card.classList.remove('expanded');

    setTimeout(() => {
      this.isAnimating = false;
      if (this.statusMsg) {
        this.statusMsg.textContent = '';
        this.statusMsg.className = 'status-msg';
      }
    }, 450);
  }

  setStatus(type, message) {
    if (!this.statusMsg) return;
    this.statusMsg.className = `status-msg ${type}`;
    this.statusMsg.textContent = message;
  }

  setLoading(isLoading) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isLoading;
    this.submitBtn.style.opacity = isLoading ? '0.6' : '1';
    if (isLoading) {
      this.setStatus('loading', '正在发送...');
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const message = this.messageInput ? this.messageInput.value.trim() : '';
    const name = (this.nameInput && this.nameInput.value.trim()) || '匿名访客';

    if (!message) {
      this.setStatus('error', '请输入你想说的话。');
      return;
    }

    this.setLoading(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: this.accessKey,
          name: name,
          message: message,
          subject: `来自 ${name} 的悄悄话`
        })
      });

      const data = await response.json();

      if (data.success) {
        this.setStatus('success', '发送成功，信件已送达博主邮箱。');
        this.form.reset();
      } else {
        this.setStatus('error', data.message || '发送失败，请稍后重试。');
      }
    } catch (err) {
      this.setStatus('error', '网络连接异常，发送失败。');
    } finally {
      this.setLoading(false);
    }
  }

  bindEvents() {
    // Click on card when collapsed triggers expansion
    this.card.addEventListener('click', (e) => {
      if (!this.isExpanded && !this.isAnimating) {
        this.expand();
      }
    });

    // Close button collapses
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.collapse();
      });
    }

    // Escape key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded) {
        this.collapse();
      }
    });

    // Window resize maintains fluid bounds
    window.addEventListener('resize', () => {
      if (this.isExpanded && !this.isAnimating) {
        const { width, height } = this.getExpandedSize();
        this.card.style.width = `${width}px`;
        this.card.style.height = `${height}px`;
      }
    }, { passive: true });

    // Form submit
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }
}
