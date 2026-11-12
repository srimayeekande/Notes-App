import { Note } from '../models/note.js';
import { INITIAL_SAMPLE_NOTES } from './seed-data.js';

const STORAGE_KEYS = {
  NOTES: 'notes_app_notes_v1',
  CATEGORIES: 'notes_app_categories_v1',
  SETTINGS: 'notes_app_settings_v1',
  THEME: 'notes_app_theme_v1'
};

const DEFAULT_CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Study'];

/**
 * StorageService handles persistence into LocalStorage with robust error handling
 */
export class StorageService {
  constructor() {
    this.ensureInitialized();
  }

  /**
   * Initializes default categories and verifies storage capability
   */
  ensureInitialized() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
          viewMode: 'grid',
          sortBy: 'updated-desc',
          splitPreview: true
        }));
      }
      if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
        this.saveNotes(INITIAL_SAMPLE_NOTES);
      }
    } catch (e) {
      console.warn('LocalStorage access is restricted or unavailable:', e);
    }
  }

  /**
   * Fetches all notes from LocalStorage as Note instances
   * @returns {Note[]}
   */
  getNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => new Note(item));
    } catch (err) {
      console.error('Error reading notes from storage:', err);
      return [];
    }
  }

  /**
   * Saves array of notes to LocalStorage
   * @param {Note[]} notes
   * @returns {boolean} Success status
   */
  saveNotes(notes) {
    try {
      const serialized = JSON.stringify(notes.map(n => (n instanceof Note ? n.toJSON() : n)));
      localStorage.setItem(STORAGE_KEYS.NOTES, serialized);
      return true;
    } catch (err) {
      console.error('Error saving notes to storage:', err);
      return false;
    }
  }

  /**
   * Saves or updates a single note
   * @param {Note} note 
   */
  saveNote(note) {
    const notes = this.getNotes();
    const index = notes.findIndex(n => n.id === note.id);
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.unshift(note);
    }
    this.saveNotes(notes);
  }

  /**
   * Removes a note completely by ID
   * @param {string} id 
   */
  deleteNote(id) {
    const notes = this.getNotes().filter(n => n.id !== id);
    this.saveNotes(notes);
  }

  /**
   * Clears all notes currently in Trash
   */
  emptyTrash() {
    const notes = this.getNotes().filter(n => !n.inTrash);
    this.saveNotes(notes);
  }

  /**
   * Retrieves user categories list
   * @returns {string[]}
   */
  getCategories() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  /**
   * Saves categories list
   * @param {string[]} categories 
   */
  saveCategories(categories) {
    try {
      const unique = [...new Set(categories.map(c => c.trim()).filter(Boolean))];
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(unique));
      return unique;
    } catch (err) {
      console.error('Failed saving categories:', err);
      return DEFAULT_CATEGORIES;
    }
  }

  /**
   * Adds a new category if not already existing
   * @param {string} name 
   */
  addCategory(name) {
    const categories = this.getCategories();
    const clean = name.trim();
    if (clean && !categories.includes(clean)) {
      categories.push(clean);
      this.saveCategories(categories);
    }
    return categories;
  }

  /**
   * Removes a category
   * @param {string} name 
   */
  removeCategory(name) {
    let categories = this.getCategories().filter(c => c !== name);
    if (categories.length === 0) categories = ['General'];
    this.saveCategories(categories);
    return categories;
  }

  /**
   * Gets application settings
   * @returns {Object}
   */
  getSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : { viewMode: 'grid', sortBy: 'updated-desc' };
    } catch {
      return { viewMode: 'grid', sortBy: 'updated-desc' };
    }
  }

  /**
   * Updates partial application settings
   * @param {Object} partial 
   */
  saveSettings(partial) {
    try {
      const current = this.getSettings();
      const merged = { ...current, ...partial };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      return merged;
    } catch (err) {
      console.error('Failed saving settings:', err);
      return null;
    }
  }

  /**
   * Gets current active theme
   * @returns {string}
   */
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  }

  /**
   * Persists active theme
   * @param {string} theme 
   */
  saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  /**
   * Calculates local storage usage in Kilobytes and estimated quota percentage
   * @returns {{ usedKB: number, percent: number }}
   */
  getStorageMetrics() {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
    const usedKB = (totalBytes / 1024).toFixed(1);
    // Typical browser localStorage quota is ~5MB (5120KB)
    const percent = Math.min(100, Math.max(1, Math.round((totalBytes / (5 * 1024 * 1024)) * 100)));
    return { usedKB, percent };
  }
}
