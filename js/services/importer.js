import { Note } from '../models/note.js';

/**
 * ImportService parses uploaded backup files and markdown documents
 */
export class ImportService {
  /**
   * Reads and parses a user-selected File
   * @param {File} file 
   * @returns {Promise<{ notes: Note[], categories?: string[] }>}
   */
  static readFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;

          if (file.name.endsWith('.json')) {
            const parsed = this.parseJSONBackup(content);
            resolve(parsed);
          } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
            const note = this.parseTextFile(file.name, content);
            resolve({ notes: [note] });
          } else {
            reject(new Error('Unsupported file extension. Please select a .json, .md, or .txt file.'));
          }
        } catch (err) {
          reject(new Error(`Failed to parse file: ${err.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Error reading file.'));
      reader.readAsText(file);
    });
  }

  /**
   * Validates and parses Notes App JSON export file
   * @param {string} jsonString 
   * @returns {{ notes: Note[], categories: string[] }}
   */
  static parseJSONBackup(jsonString) {
    const data = JSON.parse(jsonString);

    let rawNotes = [];
    let categories = [];

    if (Array.isArray(data)) {
      rawNotes = data;
    } else if (data && Array.isArray(data.notes)) {
      rawNotes = data.notes;
      if (Array.isArray(data.categories)) {
        categories = data.categories;
      }
    } else {
      throw new Error('Invalid JSON format: missing notes array');
    }

    const notes = rawNotes.map(item => new Note(item));
    return { notes, categories };
  }

  /**
   * Converts a standalone markdown or text file into a new Note instance
   * @param {string} filename 
   * @param {string} content 
   * @returns {Note}
   */
  static parseTextFile(filename, content) {
    // Derive title from filename or first heading
    let title = filename.replace(/\.(md|txt)$/i, '');
    let body = content;

    const firstHeadingMatch = content.match(/^#\s+(.+)$/m);
    if (firstHeadingMatch) {
      title = firstHeadingMatch[1].trim();
      // Remove heading from content to avoid duplication
      body = content.replace(/^#\s+(.+)$/m, '').trim();
    }

    return new Note({
      title,
      content: body,
      category: 'General',
      tags: ['imported']
    });
  }
}
