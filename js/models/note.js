import { generateUUID } from '../utils/id.js';

/**
 * Note Model representing a single note document
 */
export class Note {
  /**
   * @param {Object} data Initial note data
   */
  constructor(data = {}) {
    this.id = data.id || generateUUID();
    this.title = (data.title || '').trim();
    this.content = data.content || '';
    this.category = data.category || 'General';
    this.tags = Array.isArray(data.tags) ? [...new Set(data.tags.map(t => String(t).trim()).filter(Boolean))] : [];
    this.color = data.color || 'default';
    this.pinned = Boolean(data.pinned);
    this.favorite = Boolean(data.favorite);
    this.archived = Boolean(data.archived);
    this.inTrash = Boolean(data.inTrash);
    this.createdAt = data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt).toISOString() : this.createdAt;
  }

  /**
   * Updates note fields and touches updatedAt timestamp
   * @param {Object} updates 
   */
  update(updates = {}) {
    if (updates.title !== undefined) this.title = updates.title.trim();
    if (updates.content !== undefined) this.content = updates.content;
    if (updates.category !== undefined) this.category = updates.category;
    if (updates.tags !== undefined && Array.isArray(updates.tags)) {
      this.tags = [...new Set(updates.tags.map(t => String(t).trim()).filter(Boolean))];
    }
    if (updates.color !== undefined) this.color = updates.color;
    if (updates.pinned !== undefined) this.pinned = Boolean(updates.pinned);
    if (updates.favorite !== undefined) this.favorite = Boolean(updates.favorite);
    if (updates.archived !== undefined) this.archived = Boolean(updates.archived);
    if (updates.inTrash !== undefined) this.inTrash = Boolean(updates.inTrash);
    
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Toggles pinned status
   */
  togglePin() {
    this.pinned = !this.pinned;
    this.updatedAt = new Date().toISOString();
    return this.pinned;
  }

  /**
   * Toggles favorite status
   */
  toggleFavorite() {
    this.favorite = !this.favorite;
    this.updatedAt = new Date().toISOString();
    return this.favorite;
  }

  /**
   * Toggles archive status
   */
  toggleArchive() {
    this.archived = !this.archived;
    if (this.archived) {
      this.pinned = false; // Unpin when archiving
    }
    this.updatedAt = new Date().toISOString();
    return this.archived;
  }

  /**
   * Move note to trash
   */
  moveToTrash() {
    this.inTrash = true;
    this.pinned = false;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Restore note from trash
   */
  restore() {
    this.inTrash = false;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Generates a plain text preview snippet
   * @param {number} length Max character length
   * @returns {string} Clean excerpt
   */
  getSnippet(length = 120) {
    if (!this.content) return 'No additional text...';
    // Strip markdown formatting symbols
    const clean = this.content
      .replace(/#+\s/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>\s/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    
    if (clean.length <= length) return clean;
    return clean.slice(0, length).trim() + '...';
  }

  /**
   * Deep clone note instance with a new ID
   * @returns {Note}
   */
  duplicate() {
    const clonedData = this.toJSON();
    delete clonedData.id;
    clonedData.title = `${this.title || 'Untitled'} (Copy)`;
    clonedData.createdAt = new Date().toISOString();
    clonedData.updatedAt = clonedData.createdAt;
    return new Note(clonedData);
  }

  /**
   * Validates if note matches a search query
   * @param {string} query Search text
   * @returns {boolean}
   */
  matchesQuery(query) {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    if (q.startsWith('#')) {
      const tagQuery = q.slice(1);
      return this.tags.some(tag => tag.toLowerCase().includes(tagQuery));
    }
    return (
      this.title.toLowerCase().includes(q) ||
      this.content.toLowerCase().includes(q) ||
      this.category.toLowerCase().includes(q) ||
      this.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  /**
   * Serializes note to raw JSON object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      category: this.category,
      tags: [...this.tags],
      color: this.color,
      pinned: this.pinned,
      favorite: this.favorite,
      archived: this.archived,
      inTrash: this.inTrash,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
