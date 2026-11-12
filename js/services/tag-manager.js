/**
 * TagManager handles category and tag extraction, indexing, and UI rendering
 */
export class TagManager {
  /**
   * @param {import('./storage.js').StorageService} storage 
   * @param {import('./notification.js').NotificationService} notifications 
   */
  constructor(storage, notifications) {
    this.storage = storage;
    this.notifications = notifications;

    this.categoriesListEl = document.getElementById('categories-list');
    this.tagsCloudEl = document.getElementById('tags-cloud');
    this.categorySelectEl = document.getElementById('note-category-select');
    this.addCategoryBtn = document.getElementById('add-category-btn');
    this.categoryModal = document.getElementById('category-modal');
    this.newCategoryInput = document.getElementById('new-category-name-input');
    this.saveCategoryBtn = document.getElementById('save-new-category-btn');

    this.onFilterSelectCallback = null;
    this.initCategoryModal();
  }

  /**
   * Registers callback for when a category or tag is selected in sidebar
   * @param {Function} cb 
   */
  onFilterSelect(cb) {
    this.onFilterSelectCallback = cb;
  }

  /**
   * Sets up category creation modal bindings
   */
  initCategoryModal() {
    this.addCategoryBtn?.addEventListener('click', () => {
      if (this.newCategoryInput) this.newCategoryInput.value = '';
      this.categoryModal?.classList.remove('hidden');
      setTimeout(() => this.newCategoryInput?.focus(), 100);
    });

    this.saveCategoryBtn?.addEventListener('click', () => {
      this.handleCreateCategory();
    });

    this.newCategoryInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleCreateCategory();
      }
    });

    // Modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        modal?.classList.add('hidden');
      });
    });
  }

  /**
   * Handles creation of a custom category
   */
  handleCreateCategory() {
    const val = this.newCategoryInput?.value.trim();
    if (!val) {
      this.notifications.warning('Please enter a category name');
      return;
    }

    const categories = this.storage.getCategories();
    if (categories.map(c => c.toLowerCase()).includes(val.toLowerCase())) {
      this.notifications.warning(`Category "${val}" already exists`);
      return;
    }

    this.storage.addCategory(val);
    this.notifications.success(`Category "${val}" created`);
    this.categoryModal?.classList.add('hidden');
    this.render();
  }

  /**
   * Re-renders sidebar categories, editor dropdown options, and tags cloud
   * @param {import('../models/note.js').Note[]} notes 
   * @param {string} activeCategory 
   * @param {string} activeTag 
   */
  render(notes = [], activeCategory = null, activeTag = null) {
    this.renderCategoriesList(notes, activeCategory);
    this.renderEditorCategoryOptions();
    this.renderTagsCloud(notes, activeTag);
  }

  /**
   * Renders the sidebar categories list
   */
  renderCategoriesList(notes, activeCategory) {
    if (!this.categoriesListEl) return;
    this.categoriesListEl.innerHTML = '';

    const categories = this.storage.getCategories();
    
    // Count notes per category (excluding trash)
    const categoryCounts = {};
    categories.forEach(c => { categoryCounts[c] = 0; });
    notes.filter(n => !n.inTrash).forEach(n => {
      if (categoryCounts[n.category] !== undefined) {
        categoryCounts[n.category]++;
      }
    });

    categories.forEach(cat => {
      const li = document.createElement('li');
      li.className = `nav-item ${activeCategory === cat ? 'active' : ''}`;
      
      const link = document.createElement('a');
      link.href = `#category/${encodeURIComponent(cat)}`;
      link.className = 'nav-link';

      const dot = document.createElement('span');
      const dotClass = `cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      dot.className = `category-dot ${dotClass}`;

      const label = document.createElement('span');
      label.className = 'nav-label';
      label.textContent = cat;

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = categoryCounts[cat] || 0;

      link.appendChild(dot);
      link.appendChild(label);
      link.appendChild(badge);

      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.onFilterSelectCallback) {
          this.onFilterSelectCallback('category', cat);
        }
      });

      li.appendChild(link);

      // Add delete option for non-default categories
      if (!['General', 'Work', 'Personal'].includes(cat)) {
        const delBtn = document.createElement('button');
        delBtn.className = 'category-delete-btn icon-btn-xs';
        delBtn.title = `Delete ${cat}`;
        delBtn.innerHTML = '&times;';
        delBtn.onclick = async (e) => {
          e.stopPropagation();
          const confirmed = await this.notifications.confirm(`Delete category "${cat}"? Notes will move to General.`);
          if (confirmed) {
            this.storage.removeCategory(cat);
            // Reassign affected notes
            notes.forEach(n => {
              if (n.category === cat) {
                n.category = 'General';
                this.storage.saveNote(n);
              }
            });
            this.render(notes);
          }
        };
        link.appendChild(delBtn);
      }

      this.categoriesListEl.appendChild(li);
    });
  }

  /**
   * Updates note editor category select options
   */
  renderEditorCategoryOptions() {
    if (!this.categorySelectEl) return;
    const currentVal = this.categorySelectEl.value;
    const categories = this.storage.getCategories();

    this.categorySelectEl.innerHTML = '';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      this.categorySelectEl.appendChild(opt);
    });

    if (categories.includes(currentVal)) {
      this.categorySelectEl.value = currentVal;
    }
  }

  /**
   * Extracts all unique tags and displays tag cloud
   */
  renderTagsCloud(notes, activeTag) {
    if (!this.tagsCloudEl) return;
    this.tagsCloudEl.innerHTML = '';

    const tagCounts = {};
    notes.filter(n => !n.inTrash).forEach(n => {
      n.tags.forEach(tag => {
        const clean = tag.toLowerCase();
        tagCounts[clean] = (tagCounts[clean] || 0) + 1;
      });
    });

    const tags = Object.keys(tagCounts).sort();

    if (tags.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'text-muted';
      empty.style.fontSize = '0.75rem';
      empty.style.padding = '0 6px';
      empty.textContent = 'No tags created yet';
      this.tagsCloudEl.appendChild(empty);
      return;
    }

    tags.forEach(tag => {
      const chip = document.createElement('button');
      chip.className = `tag-chip ${activeTag === tag ? 'active' : ''}`;
      chip.textContent = `#${tag} (${tagCounts[tag]})`;

      chip.addEventListener('click', () => {
        if (this.onFilterSelectCallback) {
          this.onFilterSelectCallback('tag', tag);
        }
      });

      this.tagsCloudEl.appendChild(chip);
    });
  }
}
