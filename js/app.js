/**
 * 极速原生悄悄话投递逻辑
 * - 0 第三方依赖，极小体积
 * - 支持 Ctrl/Cmd + Enter 快捷键快速发送
 * - 自动检测 Mac / Windows 快捷键标识
 * - 防重复快速提交与人性化错误恢复
 */

(() => {
  'use strict';

  const ACCESS_KEY = '8f2c9af3-1017-40b7-8ccd-9409fa5dcbfd';
  const API_ENDPOINT = 'https://api.web3forms.com/submit';

  function init() {
    const form = document.getElementById('whisper-form');
    if (!form) return;

    const nameInput = document.getElementById('user-name');
    const messageInput = document.getElementById('user-message');
    const submitBtn = document.getElementById('submit-btn');
    const statusMsg = document.getElementById('status-msg');
    const modKey = document.getElementById('mod-key');

    // 1. 自动适配 Mac 或 Windows / Linux 快捷键提示
    if (modKey && /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent)) {
      modKey.textContent = '⌘';
    }

    let isSubmitting = false;

    function setStatus(type, text) {
      if (!statusMsg) return;
      if (!type || !text) {
        statusMsg.className = 'status-msg';
        statusMsg.textContent = '';
        return;
      }
      statusMsg.className = `status-msg ${type}`;
      statusMsg.textContent = text;
    }

    function setLoading(loading) {
      isSubmitting = loading;
      if (submitBtn) {
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? '正在发送...' : '发送';
      }
      if (loading) {
        setStatus('loading', '信件投递中，请稍候...');
      }
    }

    // 输入时自动清除错误提示
    function clearStatusOnInput() {
      if (statusMsg && statusMsg.classList.contains('error')) {
        setStatus('', '');
      }
    }

    if (nameInput) nameInput.addEventListener('input', clearStatusOnInput, { passive: true });
    if (messageInput) {
      messageInput.addEventListener('input', clearStatusOnInput, { passive: true });

      // 2. 快捷键监听：Ctrl + Enter 或 Cmd + Enter 快速提交
      messageInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (!isSubmitting) {
            form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
          }
        }
      });
    }

    // 3. 表单提交处理
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const message = messageInput ? messageInput.value.trim() : '';
      const name = (nameInput && nameInput.value.trim()) || '匿名访客';

      if (!message) {
        setStatus('error', '请写下你想说的话后再发送。');
        if (messageInput) messageInput.focus();
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: ACCESS_KEY,
            name: name,
            message: message,
            subject: `[悄悄话] 来自 ${name} 的留言`
          })
        });

        const data = await res.json();

        if (data.success) {
          setStatus('success', '发送成功，信件已私密送达博主邮箱！');
          form.reset();
        } else {
          setStatus('error', data.message || '发送失败，请稍后重试。');
        }
      } catch (err) {
        setStatus('error', '网络连接异常，请检查网络后重试。');
      } finally {
        setLoading(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
