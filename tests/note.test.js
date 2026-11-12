import { Note } from '../js/models/note.js';

export function registerNoteTests(runner) {
  runner.describe('Note Model Tests', (it, expect) => {
    it('creates note with default attributes and unique id', () => {
      const note = new Note();
      expect(typeof note.id).toBe('string');
      expect(note.title).toBe('');
      expect(note.category).toBe('General');
      expect(note.pinned).toBe(false);
      expect(note.archived).toBe(false);
      expect(note.inTrash).toBe(false);
    });

    it('updates note content and timestamp', () => {
      const note = new Note({ title: 'Old Title' });
      note.update({ title: 'New Title', content: 'Updated content' });
      expect(note.title).toBe('New Title');
      expect(note.content).toBe('Updated content');
    });

    it('toggles pin, favorite, and archive status', () => {
      const note = new Note();
      note.togglePin();
      expect(note.pinned).toBe(true);
      note.togglePin();
      expect(note.pinned).toBe(false);

      note.toggleFavorite();
      expect(note.favorite).toBe(true);

      note.toggleArchive();
      expect(note.archived).toBe(true);
    });

    it('duplicates note with new id and cloned properties', () => {
      const original = new Note({ title: 'Master Plan', content: 'Secret thoughts', tags: ['work'] });
      const copy = original.duplicate();
      expect(copy.id !== original.id).toBeTruthy();
      expect(copy.title).toBe('Master Plan (Copy)');
      expect(copy.content).toBe('Secret thoughts');
      expect(copy.tags).toEqual(['work']);
    });

    it('cleans snippet text from raw markdown', () => {
      const note = new Note({ content: '## Heading Two\nThis is a **bold** statement and `code` sample.' });
      const snippet = note.getSnippet();
      expect(snippet.includes('##')).toBeFalsy();
      expect(snippet.includes('**')).toBeFalsy();
      expect(snippet.includes('Heading Two')).toBeTruthy();
    });

    it('matches search query across title, content, and tags', () => {
      const note = new Note({
        title: 'Project Roadmap',
        content: 'Refactor storage module',
        tags: ['architecture', 'javascript']
      });
      expect(note.matchesQuery('roadmap')).toBeTruthy();
      expect(note.matchesQuery('storage')).toBeTruthy();
      expect(note.matchesQuery('#architecture')).toBeTruthy();
      expect(note.matchesQuery('nonexistent')).toBeFalsy();
    });
  });
}
