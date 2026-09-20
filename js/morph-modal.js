/**
 * MorphModal - Controller for Expanding Button into Whisper Window & Form Submission
 * 
 * Features:
 * - Fluid expansion from compact pill button to glassmorphic question window
 * - Keyboard (Escape) & close button collapse
 * - Simplified form submission (Username + Message) via Web3Forms API
 * - Accessible status banners with zero emojis
 */
export class MorphModal {
  constructor(cardElement, accessKey = '8f2c9af3-1017-40b7-8ccd-9409fa5dcbfd') {
    this.card = cardElement;
    this.accessKey = accessKey;
    this.closeBtn = this.card.querySelector('#close-btn');
    this.form = this.card.querySelector('#whisper-form');
    this.submitBtn = this.card.querySelector('#submit-btn');
    this.statusMsg = this.card.querySelector('#status-msg');
    this.nameInput = this.card.querySelector('#user-name');
    this.messageInput = this.card.querySelector('#user-message');
    this.isExpanded = false;

    this.bindEvents();
  }

  expand() {
    if (this.isExpanded) return;
    this.isExpanded = true;
    this.card.classList.add('expanded');
    setTimeout(() => {
      if (this.nameInput) this.nameInput.focus();
    }, 250);
  }

  collapse() {
    if (!this.isExpanded) return;
    this.isExpanded = false;
    this.card.classList.remove('expanded');
    if (this.statusMsg) {
      setTimeout(() => {
        this.statusMsg.textContent = '';
        this.statusMsg.className = 'status-msg';
      }, 300);
    }
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
      if (!this.isExpanded) {
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

    // Form submit
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }
}
