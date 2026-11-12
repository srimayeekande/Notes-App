import { Note } from '../models/note.js';

export const INITIAL_SAMPLE_NOTES = [
  new Note({
    id: 'welcome-note-001',
    title: 'Welcome to Notes App! 🚀',
    content: `# Welcome to your new workspace!\n\nNotes App is designed to help you organize ideas, track projects, and capture thoughts with zero friction.\n\n### Key Features at a Glance\n- **Markdown Support:** Write with headings, **bold**, *italics*, quotes, tables, and code.\n- **Tags & Categories:** Organize with \`#tags\` and custom categories.\n- **Instant Search:** Find notes in milliseconds.\n- **Theme Switcher:** Choose between Light, Dark, Solarized, Nord, and Sepia.\n- **Keyboard Shortcuts:** Press \`Ctrl + /\` (or \`Cmd + /\`) anytime.\n\n\`\`\`javascript\n// Pure vanilla JavaScript, zero bloat!\nconst app = 'Fast & Modern';\nconsole.log(\`Hello, \${app}!\`);\n\`\`\`\n\n> "Organization isn't about perfection. It's about efficiency, reducing stress and clutter, saving time and money and improving your overall quality of life."`,
    category: 'General',
    tags: ['welcome', 'getting-started', 'tips'],
    color: 'blue',
    pinned: true,
    favorite: true,
    archived: false,
    inTrash: false
  }),
  new Note({
    id: 'todo-checklist-002',
    title: 'Weekly Priorities & Tasks 📝',
    content: `### Current Sprint Goals\n\n- [x] Set up project repository\n- [x] Establish design tokens and CSS theme variables\n- [x] Implement Markdown parser & live split preview\n- [ ] Review documentation and user onboarding guide\n- [ ] Export complete backup\n\n### Daily Routine Notes\n1. Review morning tasks\n2. Block focus time for deep work\n3. Capture meeting action items`,
    category: 'Work',
    tags: ['todo', 'productivity', 'sprint'],
    color: 'green',
    pinned: false,
    favorite: false,
    archived: false,
    inTrash: false
  }),
  new Note({
    id: 'ideas-brainstorm-003',
    title: 'Application Ideas & Future Roadmap 💡',
    content: `### Concepts for Next Release\n\n| Feature | Priority | Complexity |\n| :--- | :--- | :--- |\n| Cloud Sync | High | Medium |\n| End-to-end Encryption | High | High |\n| Audio Voice Notes | Medium | Medium |\n| PDF Export | Low | Low |\n\nFeel free to duplicate this note using \`Ctrl + D\` or export it to Markdown using the download icon above!`,
    category: 'Ideas',
    tags: ['roadmap', 'features', 'brainstorm'],
    color: 'yellow',
    pinned: false,
    favorite: true,
    archived: false,
    inTrash: false
  })
];
