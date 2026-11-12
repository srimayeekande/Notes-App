# Application Architecture & Design

## Overview
Notes App is built with an event-driven, modular MVC (Model-View-Controller) architecture using modern, standards-compliant ES Modules, vanilla CSS custom properties, and semantic HTML5. It requires zero compilation, zero bundlers, and runs instantly in any modern web browser.

```
                          ┌─────────────────────────┐
                          │         App.js          │
                          │   (Master Controller)   │
                          └────────────┬────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ NotesList        │          │ Editor           │          │ Search           │
│ Controller       │          │ Controller       │          │ Controller       │
└────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
             ┌─────────────────┐               ┌─────────────────┐
             │ StorageService  │               │ Note Model      │
             │ (LocalStorage)  │               │ (Domain Entity) │
             └─────────────────┘               └─────────────────┘
```

## Core Modules

### 1. Domain Entities (`js/models/`)
- **`note.js`**: Pure domain entity containing data fields, validation logic, snippet generation, JSON serialization, and duplication.

### 2. Services (`js/services/`)
- **`storage.js`**: Persistence layer interfacing with browser `localStorage`, providing schema versioning, safe error handling, and quota metrics.
- **`notification.js`**: Toast alert hub and promise-based confirmation modal service.
- **`tag-manager.js`**: Aggregates tags across all notes, calculates frequency counts, and manages categories.
- **`exporter.js`**: File generation and browser download service for Markdown (.md), Plain Text (.txt), and complete JSON backups.
- **`importer.js`**: File ingestion service handling JSON backup validation and markdown import parsing.

### 3. Controllers (`js/controllers/`)
- **`editor-controller.js`**: Coordinates note editing, debounced auto-save, formatting toolbar actions, live markdown preview, and metadata.
- **`notes-list-controller.js`**: Manages notes list rendering, sorting algorithms, card styling, and grid/list view toggles.
- **`search-controller.js`**: Real-time multi-criteria filtering across queries, categories, tags, and status states.
- **`shortcuts-controller.js`**: Global hotkey orchestration.

### 4. Utilities (`js/utils/`)
- **`markdown.js`**: Zero-dependency markdown parser with built-in XSS sanitization.
- **`text-stats.js`**: Word count, character count, reading time calculator, and humanized relative date formatting.
- **`id.js`**: RFC4122 compliant UUID v4 generator.
