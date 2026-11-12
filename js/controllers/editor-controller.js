import { Note } from '../models/note.js';
import { parseMarkdown } from '../utils/markdown.js';
import { calculateTextStats, formatRelativeTime } from '../utils/text-stats.js';

export class EditorController {
  /**
   * @param {import('../services/storage.js').StorageService} storage 
   * @param {import('../services/notification.js').NotificationService} notifications 
   */
  constructor(storage, notifications) {
    this.storage = storage;
    this.notifications = notifications;

    this.activeNote = null;
    this.autoSaveTimer = null;
    this.onNoteSavedCallback = null;
    this.onNoteDeletedCallback = null;

    // Cache DOM Elements
    this.emptyStateEl = document.getElementById('editor-empty-state');
    this.activeContainerEl = document.getElementById('editor-active-container');
    this.titleInput = document.getElementById('note-title-input');
    this.bodyTextarea = document.getElementById('note-body-textarea');
    this.previewEl = document.getElementById('markdown-preview');
    this.splitWorkspaceEl = document.getElementById('editor-split-workspace');
    this.categorySelect = document.getElementById('note-category-select');
    this.tagsContainer = document.getElementById('note-tags-container');
    this.tagInput = document.getElementById('note-tags-input');

    // Status & Stats
    this.autosaveStatusEl = document.getElementById('autosave-status');
    this.lastSavedTimeEl = document.getElementById('last-saved-time');
    this.statWordsEl = document.getElementById('stat-words');
    this.statCharsEl = document.getElementById('stat-chars');
    this.statReadTimeEl = document.getElementById('stat-read-time');
    this.statCreatedDateEl = document.getElementById('stat-created-date');
    this.statModifiedDateEl = document.getElementById('stat-modified-date');

    // Action buttons
    this.pinBtn = document.getElementById('pin-note-btn');
    this.favoriteBtn = document.getElementById('favorite-note-btn');
    this.archiveBtn = document.getElementById('archive-note-btn');
    this.deleteBtn = document.getElementById('delete-note-btn');
    this.duplicateBtn = document.getElementById('duplicate-note-btn');
    this.togglePreviewBtn = document.getElementById('toggle-preview-btn');
    this.colorPickerBtn = document.getElementById('color-picker-btn');
    this.colorPalettePopover = document.getElementById('color-palette-popover');

    this.bindEvents();
  }

  onNoteSaved(cb) { this.onNoteSavedCallback = cb; }
  onNoteDeleted(cb) { this.onNoteDeletedCallback = cb; }

  bindEvents() {
    // Input changes trigger debounced auto-save and stats recalculation
    this.titleInput?.addEventListener('input', () => this.handleContentChange());
    this.bodyTextarea?.addEventListener('input', () => {
      this.handleContentChange();
      this.renderPreview();
    });

    this.categorySelect?.addEventListener('change', () => {
      if (!this.activeNote) return;
      this.activeNote.category = this.categorySelect.value;
      this.saveActiveNote();
    });

    // Tag input on Enter
    this.tagInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        this.handleAddTag();
      }
    });

    // Toolbar buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        this.applyFormatting(action);
      });
    });

    // Preview split toggle
    this.togglePreviewBtn?.addEventListener('click', () => {
      this.splitWorkspaceEl?.classList.toggle('split-mode');
      this.togglePreviewBtn.classList.toggle('active');
    });

    // Color popover
    this.colorPickerBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.colorPalettePopover?.classList.toggle('hidden');
    });

    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.getAttribute('data-color');
        if (this.activeNote) {
          this.activeNote.color = color;
          this.saveActiveNote();
          this.colorPalettePopover?.classList.add('hidden');
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!this.colorPalettePopover?.contains(e.target) && e.target !== this.colorPickerBtn) {
        this.colorPalettePopover?.classList.add('hidden');
      }
    });

    // Action buttons
    this.pinBtn?.addEventListener('click', () => this.togglePin());
    this.favoriteBtn?.addEventListener('click', () => this.toggleFavorite());
    this.archiveBtn?.addEventListener('click', () => this.toggleArchive());
    this.deleteBtn?.addEventListener('click', () => this.handleDelete());
    this.duplicateBtn?.addEventListener('click', () => this.handleDuplicate());
  }

  /**
   * Sets the active note and populates the editor interface
   * @param {Note|null} note 
   */
  openNote(note) {
    this.activeNote = note;

    if (!note) {
      this.emptyStateEl?.classList.remove('hidden');
      this.activeContainerEl?.classList.add('hidden');
      return;
    }

    this.emptyStateEl?.classList.add('hidden');
    this.activeContainerEl?.classList.remove('hidden');

    if (this.titleInput) this.titleInput.value = note.title;
    if (this.bodyTextarea) this.bodyTextarea.value = note.content;
    if (this.categorySelect) this.categorySelect.value = note.category;

    this.renderTags();
    this.renderPreview();
    this.updateStats();
    this.updateActionIndicators();
  }

  handleContentChange() {
    if (!this.activeNote) return;

    // Show "Saving..." indicator
    if (this.autosaveStatusEl) {
      this.autosaveStatusEl.innerHTML = '<span class="status-dot"></span> Saving...';
      this.autosaveStatusEl.classList.add('saving');
    }

    this.updateStats();

    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.saveActiveNote();
    }, 400); // 400ms debounce
  }

  saveActiveNote() {
    if (!this.activeNote) return;

    this.activeNote.update({
      title: this.titleInput ? this.titleInput.value : '',
      content: this.bodyTextarea ? this.bodyTextarea.value : '',
      category: this.categorySelect ? this.categorySelect.value : 'General'
    });

    this.storage.saveNote(this.activeNote);

    if (this.autosaveStatusEl) {
      this.autosaveStatusEl.innerHTML = '<span class="status-dot"></span> Saved';
      this.autosaveStatusEl.classList.remove('saving');
    }
    if (this.lastSavedTimeEl) {
      this.lastSavedTimeEl.textContent = formatRelativeTime(this.activeNote.updatedAt);
    }

    if (this.onNoteSavedCallback) {
      this.onNoteSavedCallback(this.activeNote);
    }
  }

  renderPreview() {
    if (!this.previewEl || !this.bodyTextarea) return;
    const content = this.bodyTextarea.value;
    this.previewEl.innerHTML = parseMarkdown(content);
  }

  updateStats() {
    const text = this.bodyTextarea?.value || '';
    const stats = calculateTextStats(text);

    if (this.statWordsEl) this.statWordsEl.textContent = `${stats.words} ${stats.words === 1 ? 'word' : 'words'}`;
    if (this.statCharsEl) this.statCharsEl.textContent = `${stats.chars} chars`;
    if (this.statReadTimeEl) this.statReadTimeEl.textContent = `${stats.readTimeMinutes} min read`;

    if (this.activeNote) {
      if (this.statCreatedDateEl) this.statCreatedDateEl.textContent = `Created: ${formatRelativeTime(this.activeNote.createdAt)}`;
      if (this.statModifiedDateEl) this.statModifiedDateEl.textContent = `Updated: ${formatRelativeTime(this.activeNote.updatedAt)}`;
    }
  }

  updateActionIndicators() {
    if (!this.activeNote) return;
    this.pinBtn?.classList.toggle('active', this.activeNote.pinned);
    this.favoriteBtn?.classList.toggle('active', this.activeNote.favorite);
    this.archiveBtn?.classList.toggle('active', this.activeNote.archived);
  }

  handleAddTag() {
    if (!this.activeNote || !this.tagInput) return;
    const tag = this.tagInput.value.replace(/^#/, '').trim();
    if (tag && !this.activeNote.tags.includes(tag)) {
      this.activeNote.tags.push(tag);
      this.tagInput.value = '';
      this.renderTags();
      this.saveActiveNote();
    }
  }

  removeTag(tag) {
    if (!this.activeNote) return;
    this.activeNote.tags = this.activeNote.tags.filter(t => t !== tag);
    this.renderTags();
    this.saveActiveNote();
  }

  renderTags() {
    if (!this.tagsContainer) return;
    this.tagsContainer.innerHTML = '';
    if (!this.activeNote) return;

    this.activeNote.tags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'editor-tag-pill';
      pill.innerHTML = `#${tag} <span class="editor-tag-remove">&times;</span>`;
      pill.querySelector('.editor-tag-remove').onclick = () => this.removeTag(tag);
      this.tagsContainer.appendChild(pill);
    });
  }

  togglePin() {
    if (!this.activeNote) return;
    const state = this.activeNote.togglePin();
    this.saveActiveNote();
    this.updateActionIndicators();
    this.notifications.info(state ? 'Note pinned to top' : 'Note unpinned');
  }

  toggleFavorite() {
    if (!this.activeNote) return;
    const state = this.activeNote.toggleFavorite();
    this.saveActiveNote();
    this.updateActionIndicators();
    this.notifications.info(state ? 'Added to favorites' : 'Removed from favorites');
  }

  toggleArchive() {
    if (!this.activeNote) return;
    const state = this.activeNote.toggleArchive();
    this.saveActiveNote();
    this.updateActionIndicators();
    this.notifications.info(state ? 'Note moved to archive' : 'Note unarchived');
  }

  async handleDelete() {
    if (!this.activeNote) return;

    if (this.activeNote.inTrash) {
      const confirmed = await this.notifications.confirm('Permanently delete this note? This action cannot be undone.');
      if (confirmed) {
        const id = this.activeNote.id;
        this.storage.deleteNote(id);
        this.openNote(null);
        if (this.onNoteDeletedCallback) this.onNoteDeletedCallback(id);
        this.notifications.success('Note permanently deleted');
      }
    } else {
      this.activeNote.moveToTrash();
      this.storage.saveNote(this.activeNote);
      this.openNote(null);
      if (this.onNoteDeletedCallback) this.onNoteDeletedCallback(this.activeNote.id);
      this.notifications.info('Note moved to Trash');
    }
  }

  handleDuplicate() {
    if (!this.activeNote) return;
    const cloned = this.activeNote.duplicate();
    this.storage.saveNote(cloned);
    this.openNote(cloned);
    if (this.onNoteSavedCallback) this.onNoteSavedCallback(cloned);
    this.notifications.success('Note duplicated successfully');
  }

  applyFormatting(action) {
    if (!this.bodyTextarea) return;
    const start = this.bodyTextarea.selectionStart;
    const end = this.bodyTextarea.selectionEnd;
    const text = this.bodyTextarea.value;
    const selected = text.substring(start, end);

    let prefix = '';
    let suffix = '';
    let replacement = selected;

    switch (action) {
      case 'bold': prefix = '**'; suffix = '**'; break;
      case 'italic': prefix = '*'; suffix = '*'; break;
      case 'strike': prefix = '~~'; suffix = '~~'; break;
      case 'h1': prefix = '# '; break;
      case 'h2': prefix = '## '; break;
      case 'h3': prefix = '### '; break;
      case 'quote': prefix = '> '; break;
      case 'code': prefix = '`'; suffix = '`'; break;
      case 'codeblock': prefix = '```\n'; suffix = '\n```'; break;
      case 'ul': prefix = '- '; break;
      case 'ol': prefix = '1. '; break;
      case 'task': prefix = '- [ ] '; break;
      case 'link': prefix = '['; suffix = '](url)'; break;
    }

    if (!selected && !suffix) {
      // Line formatting
      replacement = prefix;
    } else {
      replacement = prefix + (selected || 'text') + suffix;
    }

    this.bodyTextarea.value = text.substring(0, start) + replacement + text.substring(end);
    this.bodyTextarea.focus();
    this.bodyTextarea.selectionStart = start + prefix.length;
    this.bodyTextarea.selectionEnd = start + prefix.length + (selected.length || (suffix ? 4 : 0));

    this.handleContentChange();
    this.renderPreview();
  }
}
