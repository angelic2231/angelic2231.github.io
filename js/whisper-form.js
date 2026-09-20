/**
 * WhisperForm - Controller for Anonymous Question Box via Web3Forms API
 * 
 * Features:
 * - Anonymous Q&A formatting with optional topics and contact info
 * - Topic pill auto-tagging
 * - Asynchronous payload submission with loading state locks
 * - Accessible status banners with zero emojis
 * - Automatic reset upon successful delivery
 */
export class WhisperForm {
  constructor(formElement, accessKey = '8f2c9af3-1017-40b7-8ccd-9409fa5dcbfd') {
    this.form = formElement;
    this.accessKey = accessKey;
    this.submitBtn = this.form.querySelector('#submit-btn');
    this.statusMsg = document.getElementById('status-msg');
    this.nameInput = this.form.querySelector('#sender-name');
    this.contactInput = this.form.querySelector('#sender-contact');
    this.messageInput = this.form.querySelector('#message-content');
    this.topicPills = document.querySelectorAll('.topic-pill');
    this.selectedTopic = '';

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
      this.setStatus('loading', '正在匿名投递问题...');
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const question = this.messageInput ? this.messageInput.value.trim() : '';
    const nickname = (this.nameInput && this.nameInput.value.trim()) || '匿名提问者';
    const contact = this.contactInput ? this.contactInput.value.trim() : '';

    if (!question) {
      this.setStatus('error', '请写下你想提出的问题。');
      return;
    }

    this.setLoading(true);

    // Format message payload for the owner
    let formattedMessage = '';
    if (this.selectedTopic) {
      formattedMessage += `[主题: ${this.selectedTopic}]\n\n`;
    }
    formattedMessage += `提问内容:\n${question}\n\n`;
    formattedMessage += `提问者: ${nickname}\n`;
    if (contact) {
      formattedMessage += `联系方式: ${contact}\n`;
    } else {
      formattedMessage += `联系方式: 无 (纯匿名)\n`;
    }

    const emailSubject = this.selectedTopic
      ? `[提问箱] ${this.selectedTopic} - 来自 ${nickname}`
      : `[提问箱] 来自 ${nickname} 的新提问`;

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: this.accessKey,
          name: nickname,
          message: formattedMessage,
          subject: emailSubject
        })
      });

      const data = await response.json();

      if (data.success) {
        this.setStatus('success', '问题已成功投递至博主的私人提问箱。');
        this.form.reset();
        this.selectedTopic = '';
        this.topicPills.forEach((p) => p.classList.remove('active'));
      } else {
        this.setStatus('error', data.message || '投递失败，请稍后重试。');
      }
    } catch (err) {
      this.setStatus('error', '网络连接异常，投递失败。');
    } finally {
      this.setLoading(false);
    }
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Topic pill click handlers
    this.topicPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const topic = pill.getAttribute('data-topic') || pill.textContent.trim();
        if (this.selectedTopic === topic) {
          this.selectedTopic = '';
          pill.classList.remove('active');
        } else {
          this.selectedTopic = topic;
          this.topicPills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
        }
      });
    });
  }
}
