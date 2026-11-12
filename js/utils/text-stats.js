/**
 * Computes comprehensive text statistics and date formatting helpers
 */

/**
 * Calculates word count, character count, and estimated reading time
 * @param {string} text Input text content
 * @returns {{ words: number, chars: number, charsNoSpaces: number, readTimeMinutes: number }}
 */
export function calculateTextStats(text = '') {
  if (!text || typeof text !== 'string') {
    return { words: 0, chars: 0, charsNoSpaces: 0, readTimeMinutes: 0 };
  }

  const chars = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;

  // Split on whitespace boundaries
  const wordsArray = text.trim().match(/[\w\d'-]+/gu) || [];
  const words = wordsArray.length;

  // Standard reading speed: ~200 words per minute
  const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    chars,
    charsNoSpaces,
    readTimeMinutes: words === 0 ? 0 : readTimeMinutes
  };
}

/**
 * Formats ISO date string into human-friendly relative or calendar time
 * @param {string} isoString 
 * @returns {string} Formatted timestamp
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '--';
  const date = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 5) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  // Format as short month & day
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
