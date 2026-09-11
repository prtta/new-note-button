# AGENTS.md

## Project

**New Note Button**

An Obsidian plugin that adds an Apple Notes-like floating button for creating a new note in Obsidian Mobile.

Repository name:

```text
new-note-button
```

Plugin ID:

```text
new-note-button
```

Display name:

```text
New Note Button
```

---

## Primary Goal

Implement a small, reliable, mobile-first Obsidian plugin that displays a persistent **New Note** button near the bottom-right corner of the editor interface.

The interaction should feel similar to the compose/new-note button in Apple Notes on iOS.

The initial version should focus on one task:

> Create a new note quickly from Obsidian Mobile.

Do not turn the plugin into a general-purpose command launcher or toolbar.

---

## Background

The motivation for this plugin came from trying to expose Obsidian's "Create new note" command on mobile.

Using Commander to place a button in the mobile title/tab bar caused undesirable behavior, including an incompletely rendered or invisible clickable button in an area that should otherwise contain no control.

This plugin should therefore **not depend on Commander** and should **not inject the button into Obsidian's title bar or tab bar**.

Instead, create an independent floating UI element.

---

## Initial Requirements

The first working version should:

- Target Obsidian Mobile, especially iOS.
- Display a floating button in the bottom-right area of the screen.
- Use an Obsidian/Lucide icon rather than a custom image where possible.
- Initially use a `plus` icon or another simple compose/new-note icon.
- Create a new Markdown note when tapped.
- Open the newly created note immediately.
- Respect Obsidian's configured new-note location when practical.
- Avoid overwriting an existing file.
- Work without Commander.
- Remain independent from the workspace title bar and tab bar.
- Respect the iOS safe area.
- Use Obsidian CSS variables so the button works with different themes.
- Clean up all created DOM elements when the plugin is unloaded.

---

## Platform Behavior

For the initial release:

- Show the button on iPhone / Obsidian iOS.
- Do not show it on desktop.
- Android support is optional and should not complicate the initial implementation.
- iPad behavior may initially follow the iOS implementation.

Prefer Obsidian's platform APIs rather than user-agent sniffing.

For example, use APIs such as:

```ts
Platform.isIosApp
```

when appropriate.

---

## New Note Creation

Prefer Obsidian's own APIs for deciding where a new note belongs.

Where possible, respect the user's Obsidian setting for new-note location instead of hard-coding a folder.

The expected flow is approximately:

1. Determine the appropriate parent folder.
2. Generate a valid, non-conflicting filename.
3. Create the Markdown file.
4. Open it in the current or appropriate workspace leaf.
5. Place the user in the new note ready to type.

An initial filename such as:

```text
Untitled.md
```

is acceptable.

If the filename already exists, create a unique variant such as:

```text
Untitled 1.md
Untitled 2.md
```

Do not overwrite existing notes.

---

## UI

The button should behave like a floating action button.

Suggested initial properties:

- Bottom-right positioning
- Circular or nearly circular shape
- Approximately 48–56 px
- Clear tap target
- Subtle shadow
- High enough `z-index` to remain accessible
- Theme-aware background and foreground colors
- Appropriate spacing from the right edge
- Appropriate spacing above Obsidian's mobile navigation controls
- iOS safe-area support

Prefer CSS such as:

```css
env(safe-area-inset-bottom)
```

where appropriate.

Avoid hard-coding assumptions about one specific iPhone model.

---

## DOM and Lifecycle

The plugin may create its own button element and attach it to an appropriate Obsidian/root DOM container.

Requirements:

- Create only one button.
- Avoid duplicates during layout changes or reloads.
- Register event listeners using Obsidian plugin lifecycle helpers where possible.
- Remove the button during `onunload()`.
- Avoid leaving orphaned DOM elements.
- Avoid monkey-patching Obsidian internals unless absolutely necessary.

Prefer public Obsidian APIs.

---

## Theme Compatibility

The plugin should work reasonably with:

- Default Obsidian theme
- Minimal
- Light themes
- Dark themes

Use Obsidian CSS variables instead of fixed colors wherever possible.

Examples:

```css
var(--interactive-accent)
var(--text-on-accent)
var(--background-primary)
var(--text-normal)
```

Do not add styling specifically for Minimal unless a genuine compatibility issue requires it.

---

## Accessibility

The button should:

- Use a real `<button>` element.
- Have an accessible label.
- Be large enough to tap reliably.
- Avoid relying only on color to communicate its purpose.

For example:

```html
aria-label="Create new note"
```

---

## Scope of Initial Version

Keep the first version deliberately small.

Implement:

- Mobile detection
- Floating button
- New note creation
- New note opening
- Basic styling
- Safe cleanup

Do not implement settings unless they are required for basic functionality.

---

## Future Features

These may be considered later but should not unnecessarily complicate the first implementation:

- Configurable button position
- Configurable button size
- Configurable icon
- Custom destination folder
- Template selection
- Long-press actions
- Multiple quick actions
- Hide while keyboard is visible
- Reposition while keyboard is visible
- Android-specific behavior
- iPad-specific layout tuning
- Haptic feedback
- Animation
- User-defined commands

Treat these as future enhancements, not initial requirements.

---

## Non-Goals

Do not:

- Reimplement Commander.
- Create a general mobile toolbar.
- Add many commands to the button.
- Modify Obsidian's tab title bar unnecessarily.
- Depend on undocumented internal APIs if a public API exists.
- Add a large framework for a simple DOM control.
- Introduce React or another UI framework unless there is a strong technical reason.

Keep dependencies minimal.

---

## Code Style

Prefer:

- TypeScript
- Small functions
- Clear naming
- Obsidian public APIs
- Minimal dependencies
- Straightforward implementation over abstraction

Avoid premature architecture.

For a feature this small, a simple structure such as the following is sufficient:

```text
main.ts
styles.css
manifest.json
```

Extract modules only when complexity actually requires it.

---

## Error Handling

The plugin should fail safely.

Examples:

- If note creation fails, do not leave the UI in a broken state.
- Avoid uncaught promise rejections.
- Log useful development errors when necessary.
- Consider using an Obsidian `Notice` for user-visible failures.

Do not show noisy notifications during normal successful note creation.

---

## Development Workflow

Before making significant changes:

1. Read this `AGENTS.md`.
2. Inspect the existing implementation.
3. Preserve the project's narrow scope.
4. Prefer the simplest implementation that satisfies the requirements.
5. Check whether Obsidian provides a public API before using DOM hacks.

After implementation:

1. Run TypeScript/build checks.
2. Fix compiler errors.
3. Verify that plugin unload removes the button.
4. Verify desktop behavior.
5. Verify iOS/mobile behavior where practical.
6. Check for duplicate buttons after reload/layout changes.

---

## Definition of Done for the First Working Version

The first version is complete when:

- The plugin loads successfully.
- No floating button appears on desktop.
- A floating New Note button appears on iOS.
- The button is visible above mobile UI controls.
- It respects the safe area.
- Tapping it creates a unique Markdown note.
- The note opens immediately.
- Existing files are never overwritten.
- Commander is not required.
- Disabling or unloading the plugin removes the button.
- The code builds without TypeScript errors.

---

## Guiding Principle

When choosing between a more sophisticated implementation and a simpler implementation, prefer the simpler one unless the sophisticated version clearly improves reliability on Obsidian Mobile.

The plugin should feel like a small native extension of Obsidian, not a separate UI system.