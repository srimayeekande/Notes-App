/**
 * Lightweight, safe Markdown-to-HTML parser and sanitizer
 */

/**
 * Escapes hazardous HTML characters to prevent XSS
 * @param {string} str 
 * @returns {string} Sanitized string
 */
export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parses markdown text into formatted, secure HTML
 * @param {string} markdown 
 * @returns {string} HTML string
 */
export function parseMarkdown(markdown) {
  if (!markdown) return '';

  let html = markdown;

  // 1. Pre-process and extract multi-line code blocks
  const codeBlocks = [];
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push({ lang, code: escapeHtml(code.trim()) });
    return placeholder;
  });

  // 2. Escape any remaining raw HTML in regular text
  html = escapeHtml(html);

  // 3. Horizontal rules
  html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr>');

  // 4. Headings (# to ######)
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 5. Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // 6. Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 7. Bold, Italic, Strikethrough
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // 8. Interactive Task Lists
  html = html.replace(/^\s*-\s*\[x\]\s*(.*$)/gim, '<li class="task-item"><input type="checkbox" checked disabled> $1</li>');
  html = html.replace(/^\s*-\s*\[ \]\s*(.*$)/gim, '<li class="task-item"><input type="checkbox" disabled> $1</li>');

  // 9. Unordered & Ordered Lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ordered">$1</li>');

  // Wrap consecutive list items
  html = html.replace(/((?:<li>(?!class="ordered").*<\/li>\s*)+)/gim, '<ul>$1</ul>');
  html = html.replace(/((?:<li class="ordered">.*<\/li>\s*)+)/gim, '<ol>$1</ol>');
  html = html.replace(/class="ordered"/g, '');

  // 10. Links: [text](url) - ensure safe schemes
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const cleanUrl = url.trim();
    if (/^(https?:\/\/|mailto:|\/|#)/i.test(cleanUrl)) {
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    return text;
  });

  // 11. Tables support
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim().length > 0);
    if (cells.some(c => /^:?-+:?$/.test(c.trim()))) {
      return ''; // Header divider row
    }
    const tdCells = cells.map(c => `<td>${c.trim()}</td>`).join('');
    return `<tr>${tdCells}</tr>`;
  });
  html = html.replace(/((?:<tr>.*<\/tr>\s*)+)/g, '<table>$1</table>');

  // 12. Paragraphs (lines separated by double newlines)
  const lines = html.split(/\n\s*\n/);
  html = lines.map(block => {
    block = block.trim();
    if (!block) return '';
    // Skip wrapping if block already starts with container tag
    if (/^<(h[1-6]|ul|ol|table|blockquote|hr|pre)/i.test(block)) {
      return block;
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  // 13. Restore multi-line code blocks
  codeBlocks.forEach((item, index) => {
    const placeholder = `__CODE_BLOCK_${index}__`;
    const langAttr = item.lang ? ` class="language-${item.lang}"` : '';
    const replacement = `<pre><code${langAttr}>${item.code}</code></pre>`;
    html = html.replace(placeholder, replacement);
  });

  return html;
}
