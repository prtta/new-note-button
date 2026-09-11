# New Note Button

A simple Obsidian plugin that adds an Apple Notes-like **New Note** button to Obsidian Mobile.

The plugin displays a floating button in the bottom-right corner of the screen, allowing you to create a new note with a single tap.

## Motivation

On iOS, Apple Notes provides an easily accessible button for creating a new note from almost anywhere in the app.

Obsidian Mobile does not currently provide an equivalent persistent button in the main editor interface.

**New Note Button** aims to provide that experience while keeping the implementation small and unobtrusive.

The button is rendered independently from Obsidian's tab/title bar, so it does not depend on plugins such as Commander.

## Features

- Floating New Note button in the bottom-right corner
- Designed primarily for Obsidian Mobile / iOS
- One-tap note creation
- Opens the newly created note immediately
- Respects the iOS safe area
- Uses Obsidian theme variables where possible
- Independent from the title bar and tab bar
- No dependency on Commander

## Planned Features

Possible future additions include:

- Configurable button position
- Configurable button size
- Configurable icon
- Custom destination folder
- Template selection
- Long-press actions
- Hide or reposition the button while the software keyboard is visible
- Improved iPad support
- Optional Android support

## Installation

The plugin is currently under development.

### Manual installation

Build locally with `npm install` and `npm run build`, or download a release when available:

1. Download the latest release.
2. Create the following directory inside your vault:

   `.obsidian/plugins/new-note-button/`

3. Place `main.js`, `manifest.json`, and `styles.css` inside that directory.
4. Restart Obsidian.
5. Open:

   **Settings → Community plugins**

6. Enable **New Note Button**.

## Development

Clone this repository into your Obsidian development vault:

```bash
cd /path/to/vault/.obsidian/plugins
git clone <repository-url> new-note-button
cd new-note-button
npm install
npm run dev
```

Reload Obsidian after making changes.

Run `npm run build` for a type-checked production build and `npm test` for
automated lifecycle and note-creation checks using a mocked Obsidian API.

The button appears only in the iOS app (including iPad), not on desktop or
Android. It creates an empty `Untitled.md` in the location selected in
Obsidian's new-note settings, adding a numeric suffix when needed, then opens
the note in editing mode. A failed open leaves the created note in the vault.

Before release, verify on an iPhone that the button clears the navigation
controls and safe area in portrait and landscape, including with the keyboard
open. Check Default and Minimal in light/dark mode, all new-note location
settings, repeated taps, and disabling/re-enabling the plugin. Keyboard-aware
repositioning is not implemented in this version.

## Project Structure

```text
new-note-button/
├── README.md
├── AGENTS.md
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── main.ts
└── styles.css
```

## Design Principles

New Note Button should remain:

- Small
- Fast
- Mobile-first
- Visually unobtrusive
- Compatible with Obsidian themes
- Independent from Obsidian's header controls
- Focused on one task: creating a new note quickly

The initial implementation intentionally avoids becoming a general-purpose toolbar or command launcher.

## Compatibility

Initial target:

- Obsidian Mobile
- iOS / iPhone

The button is intentionally hidden on desktop and Android.

## Status

🚧 **Early development**

The plugin is not yet ready for general use.

## License

MIT
