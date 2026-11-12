export class SearchController {
  constructor() {
    this.searchQuery = '';
    this.currentNavFilter = 'all'; // 'all' | 'pinned' | 'favorites' | 'archived' | 'trash'
    this.activeCategory = null;
    this.activeTag = null;

    this.onFilterChangeCallback = null;

    // DOM Elements
    this.searchInput = document.getElementById('global-search');
    this.clearSearchBtn = document.getElementById('clear-search-btn');
    this.filtersBar = document.getElementById('active-filters-bar');
    this.filterChipsContainer = document.getElementById('active-filters-chips');
    this.clearAllFiltersBtn = document.getElementById('clear-all-filters-btn');

    this.bindEvents();
  }

  onFilterChange(cb) {
    this.onFilterChangeCallback = cb;
  }

  bindEvents() {
    this.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      if (this.clearSearchBtn) {
        this.clearSearchBtn.classList.toggle('hidden', !this.searchQuery);
      }
      this.triggerChange();
    });

    this.clearSearchBtn?.addEventListener('click', () => {
      this.clearSearch();
    });

    this.clearAllFiltersBtn?.addEventListener('click', () => {
      this.clearAll();
    });

    // Global Esc shortcut clears search if focused
    this.searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
        this.searchInput.blur();
      }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    if (this.searchInput) this.searchInput.value = '';
    this.clearSearchBtn?.classList.add('hidden');
    this.triggerChange();
  }

  clearAll() {
    this.searchQuery = '';
    if (this.searchInput) this.searchInput.value = '';
    this.clearSearchBtn?.classList.add('hidden');
    this.activeCategory = null;
    this.activeTag = null;
    this.currentNavFilter = 'all';
    this.triggerChange();
  }

  setNavFilter(filter) {
    this.currentNavFilter = filter;
    this.activeCategory = null;
    this.activeTag = null;
    this.triggerChange();
  }

  setCategoryFilter(category) {
    this.activeCategory = category;
    this.activeTag = null;
    this.currentNavFilter = 'all';
    this.triggerChange();
  }

  setTagFilter(tag) {
    this.activeTag = tag;
    this.activeCategory = null;
    this.currentNavFilter = 'all';
    this.triggerChange();
  }

  triggerChange() {
    this.renderFilterChips();
    if (this.onFilterChangeCallback) {
      this.onFilterChangeCallback();
    }
  }

  /**
   * Filters master array of notes according to current search criteria
   * @param {import('../models/note.js').Note[]} allNotes 
   * @returns {import('../models/note.js').Note[]}
   */
  filterNotes(allNotes) {
    return allNotes.filter(note => {
      // 1. Navigation Status Filter
      if (this.currentNavFilter === 'trash') {
        if (!note.inTrash) return false;
      } else {
        if (note.inTrash) return false;

        if (this.currentNavFilter === 'pinned' && !note.pinned) return false;
        if (this.currentNavFilter === 'favorites' && !note.favorite) return false;
        if (this.currentNavFilter === 'archived') {
          if (!note.archived) return false;
        } else {
          // If not in archived view, hide archived notes from general listings
          if (note.archived && this.currentNavFilter !== 'all') return false;
        }
      }

      // 2. Category Filter
      if (this.activeCategory && note.category !== this.activeCategory) {
        return false;
      }

      // 3. Tag Filter
      if (this.activeTag && !note.tags.map(t => t.toLowerCase()).includes(this.activeTag.toLowerCase())) {
        return false;
      }

      // 4. Text Query Match
      if (this.searchQuery && !note.matchesQuery(this.searchQuery)) {
        return false;
      }

      return true;
    });
  }

  renderFilterChips() {
    if (!this.filtersBar || !this.filterChipsContainer) return;

    this.filterChipsContainer.innerHTML = '';
    let hasFilters = false;

    if (this.searchQuery) {
      hasFilters = true;
      this.addChip(`"${this.searchQuery}"`, () => this.clearSearch());
    }

    if (this.activeCategory) {
      hasFilters = true;
      this.addChip(`Category: ${this.activeCategory}`, () => {
        this.activeCategory = null;
        this.triggerChange();
      });
    }

    if (this.activeTag) {
      hasFilters = true;
      this.addChip(`#${this.activeTag}`, () => {
        this.activeTag = null;
        this.triggerChange();
      });
    }

    this.filtersBar.classList.toggle('hidden', !hasFilters);
  }

  addChip(label, onRemove) {
    const chip = document.createElement('span');
    chip.className = 'filter-chip';
    chip.innerHTML = `${label} <span class="filter-chip-remove">&times;</span>`;
    chip.querySelector('.filter-chip-remove').onclick = onRemove;
    this.filterChipsContainer.appendChild(chip);
  }

  getViewTitle() {
    if (this.activeCategory) return `Category: ${this.activeCategory}`;
    if (this.activeTag) return `Tagged: #${this.activeTag}`;
    switch (this.currentNavFilter) {
      case 'pinned': return 'Pinned Notes';
      case 'favorites': return 'Favorite Notes';
      case 'archived': return 'Archived Notes';
      case 'trash': return 'Trash';
      case 'all':
      default: return 'All Notes';
    }
  }
}
