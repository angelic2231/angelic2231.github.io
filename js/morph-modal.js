/**
 * MorphModal - Manages the Unified Whisper Panel Growth & Submission
 * 
 * Features:
 * - The button ITSELF expands into the window (never disappears)
 * - The title "悄悄话" seamlessly glides from center to window header
 * - Smooth dimensional transitions (width, height, border-radius) using cubic-bezier(0.16, 1, 0.3, 1)
 * - Offscreen clone calculation for zero-reflow target height measurement
 */
export class MorphModal {
  constructor(panelElement, accessKey = '8f2c9af3-1017-40b7-8ccd-9409fa5dcbfd') {
    this.panel = panelElement;
    this.accessKey = accessKey;
    this.panelHeader = this.panel.querySelector('.panel-header');
    this.panelBody = this.panel.querySelector('.panel-body');
    this.closeBtn = this.panel.querySelector('#close-btn');
    this.form = this.panel.querySelector('#whisper-form');
    this.submitBtn = this.panel.querySelector('#submit-btn');
    this.statusMsg = this.panel.querySelector('#status-msg');
    this.nameInput = this.panel.querySelector('#user-name');
    this.messageInput = this.panel.querySelector('#user-message');

    this.isExpanded = false;
    this.isAnimating = false;

    this.collapsedWidth = 190;
    this.collapsedHeight = 54;
    this.collapsedRadius = 27;

    this.bindEvents();
  }

  getExpandedSize() {
    const targetWidth = Math.min(420, window.innerWidth - 36);

    // Measure exact full natural height using a detached offscreen clone
    const clone = this.panel.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.pointerEvents = 'none';
    clone.style.width = `${targetWidth}px`;
    clone.style.height = 'auto';
    clone.classList.add('expanded');

    // Make body visible in clone to calculate accurate total height
    const cloneBody = clone.querySelector('.panel-body');
    if (cloneBody) {
      cloneBody.style.opacity = '1';
      cloneBody.style.transform = 'none';
      cloneBody.style.display = 'block';
    }

    document.body.appendChild(clone);
    const measuredHeight = clone.offsetHeight || 410;
    document.body.removeChild(clone);

    return { width: targetWidth, height: measuredHeight };
  }

  expand() {
    if (this.isExpanded || this.isAnimating) return;
    this.isExpanded = true;
    this.isAnimating = true;

    const { width, height } = this.getExpandedSize();

    // Lock starting dimensions
    this.panel.style.width = `${this.collapsedWidth}px`;
    this.panel.style.height = `${this.collapsedHeight}px`;
    this.panel.style.borderRadius = `${this.collapsedRadius}px`;

    // Force layout flush so transition starts cleanly from exact button geometry
    void this.panel.offsetHeight;

    // Apply target dimensions for the button to physically expand into the window
    this.panel.style.width = `${width}px`;
    this.panel.style.height = `${height}px`;
    this.panel.style.borderRadius = '28px';
    this.panel.classList.add('expanded');

    setTimeout(() => {
      this.isAnimating = false;
      if (this.nameInput) this.nameInput.focus();
    }, 450);
  }

  collapse() {
    if (!this.isExpanded || this.isAnimating) return;
    this.isExpanded = false;
    this.isAnimating = true;

    // Smoothly shrink panel back into the initial button dimensions
    this.panel.style.width = `${this.collapsedWidth}px`;
    this.panel.style.height = `${this.collapsedHeight}px`;
    this.panel.style.borderRadius = `${this.collapsedRadius}px`;
    this.panel.classList.remove('expanded');

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
    // Clicking the panel when collapsed expands it
    this.panel.addEventListener('click', (e) => {
      if (!this.isExpanded && !this.isAnimating) {
        this.expand();
      }
    });

    // Clicking close button shrinks it back
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.collapse();
      });
    }

    // Escape key shrinks it back
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded) {
        this.collapse();
      }
    });

    // Window resize keeps expanded panel nicely sized
    window.addEventListener('resize', () => {
      if (this.isExpanded && !this.isAnimating) {
        const { width, height } = this.getExpandedSize();
        this.panel.style.width = `${width}px`;
        this.panel.style.height = `${height}px`;
      }
    }, { passive: true });

    // Form submit
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }
}
