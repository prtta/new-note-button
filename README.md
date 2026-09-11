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
- Hides while either mobile sidebar is open
- Respects the iOS safe area
- Uses Obsidian theme variables where possible
- Independent from the title bar and tab bar
- No dependency on Commander

## Installation

### Community plugins

Once the plugin is listed in the Obsidian Community Plugins directory:

1. Open **Settings → Community plugins** in Obsidian.
2. Select **Browse** and search for **New Note Button**.
3. Install the plugin, then enable it.

### Manual installation

Download the latest release from GitHub:

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Create the following directory inside your vault:

   `.obsidian/plugins/new-note-button/`

3. Place the three downloaded files inside that directory.
4. Restart Obsidian.
5. Open:

   **Settings → Community plugins**

6. Enable **New Note Button**.

## Development

Clone this repository into your Obsidian development vault:

```bash
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/prtta/new-note-button.git
cd new-note-button
npm install
npm run dev
```

Reload Obsidian after making changes.

Run `npm run build` for a type-checked production build and `npm test` for
automated lifecycle and note-creation checks using a mocked Obsidian API.

## How it works

The button creates an empty `Untitled.md` in the location selected in
Obsidian's new-note settings and immediately opens it in editing mode. If that
name already exists, the plugin uses `Untitled 1.md`, `Untitled 2.md`, and so
on. Existing files are never overwritten.

The button is hidden while either mobile sidebar is open and returns when the
sidebar closes.

## Privacy

New Note Button works entirely inside your vault. It does not use network
connections, accounts, analytics, telemetry, or advertising.

## Project Structure

```text
new-note-button/
├── README.md
├── LICENSE
├── AGENTS.md
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── main.ts
├── styles.css
└── tests/
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

New Note Button requires Obsidian 1.13.7 or later and is designed for iPhone
and iPad. The button is intentionally hidden on desktop and Android.
Keyboard-aware repositioning is not included in the current version.

## License

[MIT](LICENSE) © 2026 prtta
