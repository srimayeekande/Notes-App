import { formatRelativeTime } from '../utils/text-stats.js';

export class NotesListController {
  /**
   * @param {import('../services/storage.js').StorageService} storage 
   * @param {import('../services/notification.js').NotificationService} notifications 
   */
  constructor(storage, notifications) {
    this.storage = storage;
    this.notifications = notifications;

    this.notes = [];
    this.activeNoteId = null;
    this.currentViewMode = 'grid'; // 'grid' | 'list'
    this.currentSort = 'updated-desc';

    this.onNoteSelectedCallback = null;
    this.onNoteRestoredCallback = null;

    // DOM Elements
    this.container = document.getElementById('notes-container');
    this.viewTitleEl = document.getElementById('current-view-title');
    this.viewCountEl = document.getElementById('notes-view-count');
    this.sortSelect = document.getElementById('notes-sort-select');
    this.emptyTrashBtn = document.getElementById('empty-trash-btn');
    this.viewGridBtn = document.getElementById('view-grid-btn');
    this.viewListBtn = document.getElementById('view-list-btn');

    this.bindEvents();
  }

  onNoteSelected(cb) { this.onNoteSelectedCallback = cb; }
  onNoteRestored(cb) { this.onNoteRestoredCallback = cb; }

  bindEvents() {
    this.sortSelect?.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.storage.saveSettings({ sortBy: this.currentSort });
      this.render();
    });

    this.viewGridBtn?.addEventListener('click', () => this.setViewMode('grid'));
    this.viewListBtn?.addEventListener('click', () => this.setViewMode('list'));

    this.emptyTrashBtn?.addEventListener('click', async () => {
      const confirmed = await this.notifications.confirm('Permanently delete all notes in Trash?');
      if (confirmed) {
        this.storage.emptyTrash();
        this.notifications.success('Trash emptied');
        if (this.onNoteRestoredCallback) this.onNoteRestoredCallback();
      }
    });
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    this.storage.saveSettings({ viewMode: mode });
    if (this.container) {
      this.container.classList.toggle('grid-view', mode === 'grid');
      this.container.classList.toggle('list-view', mode === 'list');
    }
    this.viewGridBtn?.classList.toggle('active', mode === 'grid');
    this.viewListBtn?.classList.toggle('active', mode === 'list');
  }

  /**
   * Sorts array of Note instances based on active sorting criteria
   * @param {import('../models/note.js').Note[]} notes 
   * @returns {import('../models/note.js').Note[]}
   */
  sortNotes(notes) {
    return [...notes].sort((a, b) => {
      // Pinned notes always surface first unless in Trash or Archive
      if (!a.inTrash && !a.archived && !b.inTrash && !b.archived) {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      }

      switch (this.currentSort) {
        case 'updated-asc':
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        case 'created-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'created-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title-asc':
          return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
        case 'title-desc':
          return (b.title || 'Untitled').localeCompare(a.title || 'Untitled');
        case 'updated-desc':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });
  }

  /**
   * Updates notes list display
   * @param {import('../models/note.js').Note[]} notes Notes to display
   * @param {string} selectedId Currently active note ID
   * @param {string} viewTitle Header title
   */
  render(notes = this.notes, selectedId = this.activeNoteId, viewTitle = null) {
    this.notes = notes;
    this.activeNoteId = selectedId;

    if (viewTitle && this.viewTitleEl) {
      this.viewTitleEl.textContent = viewTitle;
    }

    if (this.viewCountEl) {
      const count = notes.length;
      this.viewCountEl.textContent = `${count} ${count === 1 ? 'note' : 'notes'}`;
    }

    if (!this.container) return;
    this.container.innerHTML = '';

    if (notes.length === 0) {
      this.renderEmptyState();
      return;
    }

    const sorted = this.sortNotes(notes);

    sorted.forEach(note => {
      const card = this.createNoteCard(note);
      this.container.appendChild(card);
    });
  }

  /**
   * Builds note card DOM element
   */
  createNoteCard(note) {
    const card = document.createElement('div');
    card.className = `note-card ${note.id === this.activeNoteId ? 'active' : ''}`;
    card.setAttribute('data-id', note.id);
    card.setAttribute('data-color', note.color || 'default');

    // Header
    const header = document.createElement('div');
    header.className = 'note-card-header';

    const title = document.createElement('h4');
    title.className = 'note-card-title';
    title.textContent = note.title || 'Untitled Note';

    const indicators = document.createElement('div');
    indicators.className = 'note-card-indicators';

    if (note.pinned) {
      indicators.innerHTML += `<svg class="icon icon-pinned" title="Pinned"><use href="assets/icons.svg#icon-pin"></use></svg>`;
    }
    if (note.favorite) {
      indicators.innerHTML += `<svg class="icon icon-starred" title="Favorite"><use href="assets/icons.svg#icon-star"></use></svg>`;
    }

    header.appendChild(title);
    header.appendChild(indicators);
    card.appendChild(header);

    // Snippet
    const snippet = document.createElement('p');
    snippet.className = 'note-card-snippet';
    snippet.textContent = note.getSnippet(110);
    card.appendChild(snippet);

    // Tags
    if (note.tags && note.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'note-card-tags';
      note.tags.slice(0, 3).forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'note-card-tag';
        tagSpan.textContent = `#${tag}`;
        tagsContainer.appendChild(tagSpan);
      });
      if (note.tags.length > 3) {
        const moreSpan = document.createElement('span');
        moreSpan.className = 'note-card-tag';
        moreSpan.textContent = `+${note.tags.length - 3}`;
        tagsContainer.appendChild(moreSpan);
      }
      card.appendChild(tagsContainer);
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'note-card-footer';

    const dateSpan = document.createElement('span');
    dateSpan.textContent = formatRelativeTime(note.updatedAt);
    footer.appendChild(dateSpan);

    const categorySpan = document.createElement('span');
    categorySpan.textContent = note.category;
    categorySpan.style.opacity = '0.8';
    footer.appendChild(categorySpan);

    card.appendChild(footer);

    // Card click event
    card.addEventListener('click', () => {
      this.activeNoteId = note.id;
      document.querySelectorAll('.note-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      if (this.onNoteSelectedCallback) {
        this.onNoteSelectedCallback(note);
      }
    });

    return card;
  }

  renderEmptyState() {
    const empty = document.createElement('div');
    empty.className = 'notes-empty-state';
    empty.innerHTML = `
      <svg class="icon"><use href="assets/icons.svg#icon-file-text"></use></svg>
      <h4>No notes found</h4>
      <p>No matching notes in this view. Try adjusting filters or create a new note.</p>
    `;
    this.container.appendChild(empty);
  }
}
