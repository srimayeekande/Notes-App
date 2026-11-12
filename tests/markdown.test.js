import { parseMarkdown, escapeHtml } from '../js/utils/markdown.js';

export function registerMarkdownTests(runner) {
  runner.describe('Markdown & Sanitizer Tests', (it, expect) => {
    it('escapes hazardous HTML tags preventing XSS', () => {
      const malicious = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
      const escaped = escapeHtml(malicious);
      expect(escaped.includes('<script>')).toBeFalsy();
      expect(escaped.includes('&lt;script&gt;')).toBeTruthy();
    });

    it('parses markdown headings correctly', () => {
      const parsed = parseMarkdown('# Heading One\n## Heading Two');
      expect(parsed.includes('<h1>Heading One</h1>')).toBeTruthy();
      expect(parsed.includes('<h2>Heading Two</h2>')).toBeTruthy();
    });

    it('formats bold and italic inline styles', () => {
      const parsed = parseMarkdown('Text with **bold** and *italic* words');
      expect(parsed.includes('<strong>bold</strong>')).toBeTruthy();
      expect(parsed.includes('<em>italic</em>')).toBeTruthy();
    });

    it('transforms unordered and ordered lists', () => {
      const md = '- Item 1\n- Item 2';
      const parsed = parseMarkdown(md);
      expect(parsed.includes('<ul>')).toBeTruthy();
      expect(parsed.includes('<li>Item 1</li>')).toBeTruthy();
    });

    it('parses code blocks and maintains language attributes', () => {
      const codeBlock = '```javascript\nconst a = 10;\n```';
      const parsed = parseMarkdown(codeBlock);
      expect(parsed.includes('<pre><code class="language-javascript">')).toBeTruthy();
      expect(parsed.includes('const a = 10;')).toBeTruthy();
    });

    it('parses task checklist items', () => {
      const tasks = '- [x] Completed task\n- [ ] Pending task';
      const parsed = parseMarkdown(tasks);
      expect(parsed.includes('class="task-item"')).toBeTruthy();
      expect(parsed.includes('checked')).toBeTruthy();
    });
  });
}
