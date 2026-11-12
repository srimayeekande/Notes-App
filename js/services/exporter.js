/**
 * Exporter service handles file downloads for notes in multiple formats
 */
export class ExportService {
  /**
   * Helper to trigger native browser file download
   * @param {string} content File text contents
   * @param {string} filename Output file name
   * @param {string} mimeType MIME content type
   */
  static downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Cleans string for safe filesystem filename
   * @param {string} title 
   * @returns {string}
   */
  static sanitizeFilename(title) {
    return (title || 'untitled-note')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'note';
  }

  /**
   * Exports an individual Note as a formatted Markdown file
   * @param {import('../models/note.js').Note} note 
   */
  static exportNoteAsMarkdown(note) {
    if (!note) return;

    let markdown = `# ${note.title || 'Untitled Note'}\n\n`;
    if (note.tags && note.tags.length > 0) {
      markdown += `> **Tags:** ${note.tags.map(t => `#${t}`).join(' ')}\n`;
    }
    markdown += `> **Category:** ${note.category}\n`;
    markdown += `> **Updated:** ${new Date(note.updatedAt).toLocaleString()}\n\n`;
    markdown += `---\n\n`;
    markdown += note.content || '';

    const filename = `${this.sanitizeFilename(note.title)}.md`;
    this.downloadFile(markdown, filename, 'text/markdown');
  }

  /**
   * Exports an individual Note as clean Plain Text
   * @param {import('../models/note.js').Note} note 
   */
  static exportNoteAsText(note) {
    if (!note) return;
    const body = `${note.title}\n\n${note.content || ''}`;
    const filename = `${this.sanitizeFilename(note.title)}.txt`;
    this.downloadFile(body, filename, 'text/plain');
  }

  /**
   * Exports entire notebook database as a structured JSON backup
   * @param {import('../models/note.js').Note[]} notes 
   * @param {string[]} categories 
   */
  static exportAllAsJSON(notes, categories) {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      appName: 'Notes App',
      categories: categories || [],
      notes: notes.map(n => n.toJSON())
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = `notes-backup-${dateStamp}.json`;
    this.downloadFile(jsonString, filename, 'application/json');
  }
}
