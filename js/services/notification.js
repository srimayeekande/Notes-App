/**
 * NotificationService manages in-app toast alerts and confirmation dialogs
 */
export class NotificationService {
  constructor() {
    this.hub = document.getElementById('toast-hub');
    this.confirmModal = document.getElementById('confirm-modal');
    this.confirmMessage = document.getElementById('confirm-modal-message');
    this.confirmOkBtn = document.getElementById('confirm-ok-btn');
    this.confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    this.pendingConfirmResolver = null;

    this.initConfirmModal();
  }

  /**
   * Initializes event listeners for confirmation modal
   */
  initConfirmModal() {
    if (!this.confirmModal) return;

    this.confirmOkBtn?.addEventListener('click', () => {
      this.closeConfirm(true);
    });

    this.confirmCancelBtn?.addEventListener('click', () => {
      this.closeConfirm(false);
    });

    this.confirmModal.addEventListener('click', (e) => {
      if (e.target === this.confirmModal) {
        this.closeConfirm(false);
      }
    });
  }

  /**
   * Displays an interactive confirmation dialog, resolving a Promise with user decision
   * @param {string} message Confirmation prompt
   * @returns {Promise<boolean>}
   */
  confirm(message) {
    return new Promise((resolve) => {
      if (!this.confirmModal) {
        // Fallback if modal DOM element not found
        resolve(window.confirm(message));
        return;
      }
      this.pendingConfirmResolver = resolve;
      if (this.confirmMessage) this.confirmMessage.textContent = message;
      this.confirmModal.classList.remove('hidden');
    });
  }

  /**
   * Closes confirmation dialog and fulfills promise
   * @param {boolean} result 
   */
  closeConfirm(result) {
    if (this.confirmModal) {
      this.confirmModal.classList.add('hidden');
    }
    if (this.pendingConfirmResolver) {
      this.pendingConfirmResolver(result);
      this.pendingConfirmResolver = null;
    }
  }

  /**
   * Displays a floating toast notification
   * @param {string} message Text to display
   * @param {'info'|'success'|'warning'|'danger'} type Toast severity
   * @param {number} duration Timeout in milliseconds
   */
  show(message, type = 'info', duration = 3000) {
    if (!this.hub) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'icon-btn-xs';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.fontSize = '1.2rem';
    closeBtn.style.marginLeft = '8px';
    closeBtn.onclick = () => this.dismiss(toast);
    toast.appendChild(closeBtn);

    this.hub.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }
  }

  /**
   * Dismisses and removes a toast element
   * @param {HTMLElement} toast 
   */
  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  }

  success(msg) { this.show(msg, 'success'); }
  danger(msg) { this.show(msg, 'danger'); }
  warning(msg) { this.show(msg, 'warning'); }
  info(msg) { this.show(msg, 'info'); }
}
