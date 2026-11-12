import { Note } from './models/note.js';
import { StorageService } from './services/storage.js';
import { NotificationService } from './services/notification.js';
import { TagManager } from './services/tag-manager.js';
import { ExportService } from './services/exporter.js';
import { ImportService } from './services/importer.js';
import { EditorController } from './controllers/editor-controller.js';
import { NotesListController } from './controllers/notes-list-controller.js';
import { SearchController } from './controllers/search-controller.js';
import { ShortcutsController } from './controllers/shortcuts-controller.js';

class App {
  constructor() {
    this.storage = new StorageService();
    this.notifications = new NotificationService();
    this.tagManager = new TagManager(this.storage, this.notifications);
    this.editorController = new EditorController(this.storage, this.notifications);
    this.listController = new NotesListController(this.storage, this.notifications);
    this.searchController = new SearchController();

    this.init();
  }

  init() {
    this.setupTheme();
    this.setupSidebar();
    this.setupBackupModal();
    this.setupHashRouting();
    this.wireControllers();
    this.setupShortcuts();

    // Hydrate initial state
    this.refreshView();

    // Select first note if available
    const notes = this.storage.getNotes().filter(n => !n.inTrash && !n.archived);
    if (notes.length > 0) {
      this.selectNote(notes[0]);
    } else {
      this.editorController.openNote(null);
    }
  }

  wireControllers() {
    // When note is selected from list
    this.listController.onNoteSelected((note) => {
      this.selectNote(note);
    });

    // When note is restored or trash emptied
    this.listController.onNoteRestored(() => {
      this.refreshView();
    });

    // When note is edited and saved
    this.editorController.onNoteSaved(() => {
      this.refreshView();
    });

    // When note is deleted or trashed
    this.editorController.onNoteDeleted(() => {
      this.refreshView();
      const remaining = this.searchController.filterNotes(this.storage.getNotes());
      if (remaining.length > 0) {
        this.selectNote(remaining[0]);
      } else {
        this.editorController.openNote(null);
      }
    });

    // When search query or filters change
    this.searchController.onFilterChange(() => {
      this.refreshView();
    });

    // When category or tag is selected from sidebar
    this.tagManager.onFilterSelect((type, value) => {
      if (type === 'category') {
        this.searchController.setCategoryFilter(value);
      } else if (type === 'tag') {
        this.searchController.setTagFilter(value);
      }
      this.updateSidebarNavSelection(null);
      this.refreshView();
    });

    // Create Note buttons
    document.getElementById('create-note-btn')?.addEventListener('click', () => this.createNewNote());
    document.getElementById('empty-state-create-btn')?.addEventListener('click', () => this.createNewNote());

    // Single Note Export button in editor
    document.getElementById('export-single-note-btn')?.addEventListener('click', () => {
      const active = this.editorController.activeNote;
      if (active) {
        ExportService.exportNoteAsMarkdown(active);
        this.notifications.success('Note exported as Markdown');
      }
    });
  }

  createNewNote() {
    const newNote = new Note({
      title: 'Untitled Note',
      content: '',
      category: this.searchController.activeCategory || 'General',
      tags: this.searchController.activeTag ? [this.searchController.activeTag] : []
    });

    this.storage.saveNote(newNote);
    this.refreshView();
    this.selectNote(newNote);

    // Focus editor title input immediately
    setTimeout(() => {
      const titleInput = document.getElementById('note-title-input');
      titleInput?.focus();
      titleInput?.select();
    }, 50);

    this.notifications.info('Created new note');
  }

  selectNote(note) {
    this.editorController.openNote(note);
    this.listController.render(
      this.searchController.filterNotes(this.storage.getNotes()),
      note?.id,
      this.searchController.getViewTitle()
    );
  }

  refreshView() {
    const allNotes = this.storage.getNotes();
    const filteredNotes = this.searchController.filterNotes(allNotes);

    this.listController.render(
      filteredNotes,
      this.editorController.activeNote?.id,
      this.searchController.getViewTitle()
    );

    this.tagManager.render(
      allNotes,
      this.searchController.activeCategory,
      this.searchController.activeTag
    );

    this.updateSidebarCounts(allNotes);
    this.updateStorageDisplay();
  }

  updateSidebarCounts(notes) {
    const active = notes.filter(n => !n.inTrash);
    const countAll = active.filter(n => !n.archived).length;
    const countPinned = active.filter(n => n.pinned && !n.archived).length;
    const countFavorites = active.filter(n => n.favorite && !n.archived).length;
    const countArchived = active.filter(n => n.archived).length;
    const countTrash = notes.filter(n => n.inTrash).length;

    const setBadge = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setBadge('count-all', countAll);
    setBadge('count-pinned', countPinned);
    setBadge('count-favorites', countFavorites);
    setBadge('count-archived', countArchived);
    setBadge('count-trash', countTrash);

    // Toggle Empty Trash button visibility
    const emptyTrashBtn = document.getElementById('empty-trash-btn');
    if (emptyTrashBtn) {
      emptyTrashBtn.classList.toggle('hidden', this.searchController.currentNavFilter !== 'trash' || countTrash === 0);
    }
  }

  updateStorageDisplay() {
    const { usedKB, percent } = this.storage.getStorageMetrics();
    const textEl = document.getElementById('storage-used-text');
    const barEl = document.getElementById('storage-progress');
    if (textEl) textEl.textContent = `${usedKB} KB`;
    if (barEl) barEl.style.width = `${percent}%`;
  }

  setupTheme() {
    const savedTheme = this.storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeMenuBtn = document.getElementById('theme-menu-btn');
    const themeDropdown = document.getElementById('theme-dropdown-menu');

    themeMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown?.classList.toggle('hidden');
    });

    document.querySelectorAll('[data-theme-val]').forEach(item => {
      item.addEventListener('click', () => {
        const theme = item.getAttribute('data-theme-val');
        document.documentElement.setAttribute('data-theme', theme);
        this.storage.saveTheme(theme);
        themeDropdown?.classList.add('hidden');
        this.notifications.info(`Theme set to ${theme}`);
      });
    });

    document.addEventListener('click', (e) => {
      if (!themeDropdown?.contains(e.target) && e.target !== themeMenuBtn) {
        themeDropdown?.classList.add('hidden');
      }
    });
  }

  setupSidebar() {
    const toggleBtn = document.getElementById('toggle-sidebar-btn');
    const sidebar = document.getElementById('app-sidebar');

    toggleBtn?.addEventListener('click', () => {
      sidebar?.classList.toggle('collapsed');
    });

    // Sidebar navigation clicks
    document.querySelectorAll('.sidebar-nav .nav-item[data-filter]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = item.getAttribute('data-filter');
        this.searchController.setNavFilter(filter);
        this.updateSidebarNavSelection(filter);
        this.refreshView();
      });
    });
  }

  updateSidebarNavSelection(activeFilter) {
    document.querySelectorAll('.sidebar-nav .nav-item[data-filter]').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-filter') === activeFilter);
    });
  }

  setupBackupModal() {
    const backupBtn = document.getElementById('backup-btn');
    const backupModal = document.getElementById('backup-modal');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const exportTextBtn = document.getElementById('export-text-btn');
    const triggerImportBtn = document.getElementById('trigger-import-btn');
    const importFileInput = document.getElementById('import-file-input');

    backupBtn?.addEventListener('click', () => {
      backupModal?.classList.remove('hidden');
    });

    exportJsonBtn?.addEventListener('click', () => {
      const notes = this.storage.getNotes();
      const categories = this.storage.getCategories();
      ExportService.exportAllAsJSON(notes, categories);
      this.notifications.success('Complete database exported to JSON');
    });

    exportTextBtn?.addEventListener('click', () => {
      const active = this.editorController.activeNote;
      if (active) {
        ExportService.exportNoteAsMarkdown(active);
        this.notifications.success('Exported note');
      } else {
        this.notifications.warning('Select a note to export');
      }
    });

    triggerImportBtn?.addEventListener('click', () => {
      importFileInput?.click();
    });

    importFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const result = await ImportService.readFile(file);
        if (result.categories && result.categories.length > 0) {
          result.categories.forEach(c => this.storage.addCategory(c));
        }

        let importedCount = 0;
        result.notes.forEach(note => {
          this.storage.saveNote(note);
          importedCount++;
        });

        this.refreshView();
        backupModal?.classList.add('hidden');
        this.notifications.success(`Successfully imported ${importedCount} note(s)!`);
        if (result.notes.length > 0) {
          this.selectNote(result.notes[0]);
        }
      } catch (err) {
        this.notifications.danger(err.message || 'Import failed');
      } finally {
        importFileInput.value = '';
      }
    });
  }

  setupHashRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (['all', 'pinned', 'favorites', 'archived', 'trash'].includes(hash)) {
        this.searchController.setNavFilter(hash);
        this.updateSidebarNavSelection(hash);
        this.refreshView();
      }
    });
  }

  setupShortcuts() {
    new ShortcutsController({
      onNewNote: () => this.createNewNote(),
      onSaveNote: () => {
        this.editorController.saveActiveNote();
        this.notifications.success('Note saved immediately');
      },
      onFocusSearch: () => {
        document.getElementById('global-search')?.focus();
      },
      onToggleSidebar: () => {
        document.getElementById('app-sidebar')?.classList.toggle('collapsed');
      },
      onTogglePreview: () => {
        document.getElementById('toggle-preview-btn')?.click();
      },
      onDuplicateNote: () => {
        this.editorController.handleDuplicate();
      },
      onDeleteNote: () => {
        this.editorController.handleDelete();
      }
    });
  }
}

// Instantiate application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
