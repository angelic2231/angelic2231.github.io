/**
 * WhisperForm - Encapsulated Form Controller for Private Whispers via Web3Forms API
 * 
 * Features:
 * - Client-side validation
 * - Asynchronous payload submission with loading state locks
 * - Accessible status banners (loading, success, error) with zero emojis
 * - Automatic reset upon successful delivery
 */
export class WhisperForm {
  constructor(formElement, accessKey = '8f2c9af3-1017-40b7-8ccd-9409fa5dcbfd') {
    this.form = formElement;
    this.accessKey = accessKey;
    this.submitBtn = this.form.querySelector('#submit-btn');
    this.statusMsg = document.getElementById('status-msg');
    this.nameInput = this.form.querySelector('#sender-name');
    this.messageInput = this.form.querySelector('#message-content');

    this.bindEvents();
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
      this.setStatus('loading', '正在投递信件...');
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const message = this.messageInput ? this.messageInput.value.trim() : '';
    const name = (this.nameInput && this.nameInput.value.trim()) || '匿名访客';

    if (!message) {
      this.setStatus('error', '请输入留言内容。');
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
          subject: '来自 angelic.today 的新悄悄话'
        })
      });

      const data = await response.json();

      if (data.success) {
        this.setStatus('success', '信件已成功送达博主邮箱。');
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
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }
}
