/**
 * ShortcutsController coordinates global keyboard shortcuts across the application
 */
export class ShortcutsController {
  constructor(handlers = {}) {
    this.handlers = handlers;
    this.shortcutsModal = document.getElementById('shortcuts-modal');
    this.shortcutsBtn = document.getElementById('shortcuts-btn');

    this.bindEvents();
  }

  bindEvents() {
    this.shortcutsBtn?.addEventListener('click', () => {
      this.toggleShortcutsModal();
    });

    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  toggleShortcutsModal(forceState) {
    if (!this.shortcutsModal) return;
    if (forceState !== undefined) {
      this.shortcutsModal.classList.toggle('hidden', !forceState);
    } else {
      this.shortcutsModal.classList.toggle('hidden');
    }
  }

  /**
   * Dispatches keyboard commands
   * @param {KeyboardEvent} e 
   */
  handleKeyDown(e) {
    const isCmdOrCtrl = e.metaKey || e.ctrlKey;

    // Esc: Close any visible modal
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
      if (openModals.length > 0) {
        e.preventDefault();
        openModals.forEach(m => m.classList.add('hidden'));
        return;
      }
    }

    // Ctrl + / or Cmd + / : Shortcuts help modal
    if (isCmdOrCtrl && (e.key === '/' || e.key === '?')) {
      e.preventDefault();
      this.toggleShortcutsModal();
      return;
    }

    // Ctrl + N: New Note
    if (isCmdOrCtrl && (e.key === 'n' || e.key === 'N')) {
      e.preventDefault();
      this.handlers.onNewNote?.();
      return;
    }

    // Ctrl + S: Force save active note
    if (isCmdOrCtrl && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      this.handlers.onSaveNote?.();
      return;
    }

    // Ctrl + F: Focus global search
    if (isCmdOrCtrl && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      this.handlers.onFocusSearch?.();
      return;
    }

    // Ctrl + \: Toggle Sidebar
    if (isCmdOrCtrl && e.key === '\\') {
      e.preventDefault();
      this.handlers.onToggleSidebar?.();
      return;
    }

    // Ctrl + P: Toggle Live Markdown Preview
    if (isCmdOrCtrl && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      this.handlers.onTogglePreview?.();
      return;
    }

    // Ctrl + D: Duplicate active note
    if (isCmdOrCtrl && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      this.handlers.onDuplicateNote?.();
      return;
    }

    // Ctrl + Delete: Move to trash
    if (isCmdOrCtrl && e.key === 'Delete') {
      e.preventDefault();
      this.handlers.onDeleteNote?.();
      return;
    }
  }
}
