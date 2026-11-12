<div align="center">
  <img src="assets/favicon.svg" alt="Notes App Logo" width="80" height="80">
  <h1>Notes App</h1>
  <p><strong>A fast, modern, responsive note-taking application and Markdown editor with zero external dependencies.</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#project-structure">Structure</a> •
    <a href="#keyboard-shortcuts">Shortcuts</a> •
    <a href="#testing">Testing</a> •
    <a href="#license">License</a>
  </p>
</div>

---

## ✨ Features

- **⚡ Fast & Modern Vanilla JavaScript (ES Modules)**: No build tools, zero bundlers, instant loading in any browser.
- **📝 Rich Markdown Support**: Real-time split preview supporting headers, bold/italics, strikethrough, blockquotes, code blocks with syntax hints, tables, and interactive task checklists (`- [ ]`).
- **🔍 Instant Full-Text Search**: Live searching across titles, note bodies, categories, and `#tags`.
- **🏷️ Tags & Categories System**: Organize your notes with custom categories and tag clouds with live frequency counts.
- **🎨 5 Beautiful Built-in Themes**:
  - Light (Clean & Crisp)
  - Dark (OLED deep slate)
  - Solarized (Gentle eye comfort)
  - Nord (Arctic cool blue)
  - Sepia (Warm editorial paper)
- **🎯 Note Organization**: Pin important notes to the top, mark favorites with stars, archive completed projects, and use soft delete with trash restore.
- **🎨 Note Color Accents**: Assign customizable color stripes (Coral, Amber, Sun, Emerald, Teal, Sky, Violet, Rose) for visual prioritization.
- **💾 LocalStorage Persistence**: Seamless, conflict-free local persistence with storage quota calculation and auto-save indicator.
- **📤 Portable Export & Import**:
  - Export single notes as formatted Markdown (`.md`) or clean Plain Text (`.txt`).
  - Export full notebook backups as structured JSON.
  - Import JSON backups or drag-and-drop standalone `.md` / `.txt` files.
- **⌨️ Comprehensive Keyboard Shortcuts**: Full keyboard control (`Ctrl+N`, `Ctrl+S`, `Ctrl+F`, `Ctrl+\`, `Ctrl+P`, `Ctrl+B`, `Ctrl+I`, `Ctrl+D`, `Ctrl+Del`).
- **🧪 Built-in Browser Test Suite**: Includes automated unit tests for note data models, markdown parsing, and HTML sanitization.

---

## 🚀 Getting Started

### Prerequisites
All you need is any modern web browser (Chrome, Firefox, Safari, Edge).

### Running Locally
Clone the repository:
```bash
git clone https://github.com/srimayeekande/Notes-App.git
cd Notes-App
```

Open `index.html` in your browser:
- Double click `index.html` in your file explorer, OR
- Serve with any static web server:
  ```bash
  # Python 3
  python -m http.server 8000

  # Node.js (npx)
  npx serve .
  ```

Visit `http://localhost:8000` to start taking notes!

---

## 📂 Project Structure

```
Notes-App/
├── index.html                 # Core semantic HTML5 application shell
├── assets/
│   ├── favicon.svg            # Vector application favicon
│   └── icons.svg              # Scalable SVG symbol icons bundle
├── css/
│   ├── variables.css          # Design tokens, color system, and spacing
│   ├── reset.css              # Modern CSS reset & base normalization
│   ├── layout.css             # Multi-pane responsive layout & grid
│   ├── sidebar.css            # Navigation, categories, and tags styles
│   ├── notes-list.css         # Note cards, view toggles, and empty states
│   ├── editor.css             # Markdown editor, preview split & toolbars
│   ├── components.css         # Modals, toasts, buttons, and dropdowns
│   └── themes.css             # Light, Dark, Solarized, Nord, and Sepia
├── js/
│   ├── app.js                 # Application entry point & dependency wiring
│   ├── models/
│   │   └── note.js            # Note domain model, validation, and cloning
│   ├── services/
│   │   ├── storage.js         # LocalStorage persistence & quota manager
│   │   ├── notification.js    # Toast alert hub & confirmation dialogs
│   │   ├── tag-manager.js     # Category & tag indexing service
│   │   ├── exporter.js        # Markdown, text, and JSON export service
│   │   ├── importer.js        # Backup restore & file ingestion service
│   │   └── seed-data.js       # First-run onboarding sample data
│   ├── controllers/
│   │   ├── editor-controller.js     # Note editor & formatting controller
│   │   ├── notes-list-controller.js # Note cards list controller
│   │   ├── search-controller.js     # Instant search & filters controller
│   │   └── shortcuts-controller.js  # Global keyboard shortcut orchestrator
│   └── utils/
│       ├── id.js              # RFC4122 UUID v4 generator
│       ├── markdown.js        # Safe zero-dependency Markdown parser
│       └── text-stats.js      # Word count, reading time & date utilities
├── data/
│   └── sample-notes.json      # Sample seed notes for testing & onboarding
├── docs/
│   ├── ARCHITECTURE.md        # Deep dive into software design & data flows
│   └── SHORTCUTS.md           # Quick reference for keyboard shortcuts
├── tests/
│   ├── index.html             # Browser-based test runner
│   ├── test-runner.js         # Lightweight unit test framework
│   ├── note.test.js           # Tests for Note model & operations
│   └── markdown.test.js       # Tests for markdown parser & XSS sanitization
├── CONTRIBUTING.md            # Guidelines for open source contributors
├── SECURITY.md                # Security vulnerability disclosure policy
├── CHANGELOG.md               # Version release notes
├── LICENSE                    # MIT Open Source License
└── README.md                  # Project documentation
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Ctrl + N` / `Cmd + N` | Create a new note |
| `Ctrl + S` / `Cmd + S` | Force save note immediately |
| `Ctrl + F` / `Cmd + F` | Jump to search input |
| `Ctrl + \` / `Cmd + \` | Toggle sidebar navigation |
| `Ctrl + P` / `Cmd + P` | Toggle Markdown split preview |
| `Ctrl + B` / `Cmd + B` | Bold formatting |
| `Ctrl + I` / `Cmd + I` | Italic formatting |
| `Ctrl + D` / `Cmd + D` | Duplicate active note |
| `Ctrl + Del` | Move note to Trash |
| `Ctrl + /` | Open shortcuts help modal |
| `Esc` | Close dialogs / clear search |

---

## 🧪 Running Tests

Open `tests/index.html` directly in your browser or navigate to `http://localhost:8000/tests/index.html` while running a local server to execute the test suite.

---

## 🛡️ Security

Notes App features built-in sanitization on all markdown rendering to prevent Cross-Site Scripting (XSS) vectors. All data remains exclusively on your machine within your browser's private storage.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - feel free to use, modify, and distribute as you wish.

---
*Created by [Srimayee Kande](https://github.com/srimayeekande)*
