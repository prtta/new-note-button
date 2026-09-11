import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const { outputFiles } = await build({ entryPoints: ['main.ts'], bundle: true, external: ['obsidian'], format: 'cjs', write: false });

function setup(ios = true) {
  const buttons = [];
  const notices = [];
  const files = new Map();
  const callbacks = [];
  const workspaceEvents = new Map();
  const intervals = new Map();
  let nextInterval = 0;
  const opened = [];
  const listeners = [];
  let focused = false;
  let source;
  class MarkdownView { editor = { focus() { focused = true; } }; }
  const leaf = { view: new MarkdownView(), async openFile(file, state) { opened.push({ file, state }); } };
  const app = {
    workspace: {
      onLayoutReady(fn) { callbacks.push(fn); },
      on(name, fn) { workspaceEvents.set(name, fn); return { name, fn }; },
      leftSplit: { collapsed: true },
      rightSplit: { collapsed: true },
      getActiveFile() { return { path: 'Current/note.md' }; },
      getLeaf() { return leaf; },
    },
    fileManager: { getNewFileParent(path) { source = path; return { path: 'Notes' }; } },
    vault: {
      getAbstractFileByPath(path) { return files.get(path); },
      async create(path, content) {
        if (files.has(path)) throw new Error('Already exists');
        const file = { path, content };
        files.set(path, file);
        return file;
      },
    },
  };
  const api = {
    Plugin: class {
      app = app;
      registerEvent() {}
      registerInterval(id) { listeners.push(() => intervals.delete(id)); }
      registerDomEvent(el, type, fn) { el[type] = fn; listeners.push(() => delete el[type]); }
    },
    Platform: { isIosApp: ios }, MarkdownView,
    Notice: class { constructor(message) { notices.push(message); } },
    normalizePath: path => path.replace(/\/+/g, '/').replace(/^\//, ''),
    setIcon(el, name) { el.icon = name; },
  };
  const context = {
    exports: {}, module: { exports: {} }, require: () => api,
    console: { error() {} },
    window: {
      setInterval(fn) { const id = ++nextInterval; intervals.set(id, fn); return id; },
    },
    document: {
      createElement() { return { setAttribute(key, value) { this[key] = value; }, remove() { buttons.splice(buttons.indexOf(this), 1); } }; },
      body: { appendChild(button) { buttons.push(button); } },
    },
  };
  vm.runInNewContext(outputFiles[0].text, context);
  const plugin = new context.module.exports.default();
  plugin.onload();
  return { plugin, app, buttons, files, notices, opened, leaf, callbacks, intervals,
    ready() { callbacks.forEach(fn => fn()); },
    layoutChange() { workspaceEvents.get('layout-change')?.(); },
    tick() { intervals.forEach(fn => fn()); },
    unload() { plugin.onunload(); listeners.forEach(fn => fn()); },
    get focused() { return focused; }, get source() { return source; },
  };
}

test('desktop has no button; iOS mounts once and unload removes it', () => {
  const desktop = setup(false); desktop.ready(); assert.equal(desktop.buttons.length, 0);
  const ios = setup(); ios.ready(); ios.ready();
  assert.equal(ios.buttons.length, 1);
  assert.equal(ios.buttons[0]['aria-label'], 'Create new note');
  assert.equal(ios.buttons[0].icon, 'plus');
  ios.unload(); ios.ready(); assert.equal(ios.buttons.length, 0);
});

test('unloading before layout ready prevents a late button', () => {
  const s = setup(); s.unload(); s.ready(); assert.equal(s.buttons.length, 0);
});

test('hides while either mobile sidebar is open', () => {
  const s = setup(); s.ready();
  assert.equal(s.buttons[0].hidden, false);

  s.app.workspace.leftSplit.collapsed = false;
  s.layoutChange();
  assert.equal(s.buttons[0].hidden, true);

  s.app.workspace.leftSplit.collapsed = true;
  s.layoutChange();
  assert.equal(s.buttons[0].hidden, false);

  s.app.workspace.rightSplit.collapsed = false;
  s.layoutChange();
  assert.equal(s.buttons[0].hidden, true);

  s.app.workspace.rightSplit.collapsed = true;
  s.layoutChange();
  assert.equal(s.buttons[0].hidden, false);
});

test('restores the button when either drawer closes without a layout event', () => {
  const s = setup(); s.ready();
  for (const side of ['leftSplit', 'rightSplit']) {
    s.app.workspace[side].collapsed = false;
    s.layoutChange();
    assert.equal(s.buttons[0].hidden, true);
    // The close event arrives before collapsed changes, with no event after it.
    s.layoutChange();
    s.app.workspace[side].collapsed = true;
    s.tick();
    assert.equal(s.buttons[0].hidden, false);
  }
});

test('keeps the button hidden until both drawers close and cleans up polling', () => {
  const s = setup(); s.ready();
  s.app.workspace.leftSplit.collapsed = false;
  s.app.workspace.rightSplit.collapsed = false;
  s.tick();
  s.app.workspace.leftSplit.collapsed = true;
  s.tick();
  assert.equal(s.buttons[0].hidden, true);
  s.app.workspace.rightSplit.collapsed = true;
  s.tick();
  assert.equal(s.buttons[0].hidden, false);
  s.unload();
  assert.equal(s.intervals.size, 0);
  assert.equal(setup(false).intervals.size, 0);
});

test('uses configured folder, skips existing files and folders, opens and focuses note', async () => {
  const s = setup(); s.ready();
  s.files.set('Notes/Untitled.md', { content: 'keep' });
  s.files.set('Notes/Untitled 1.md', { children: [] });
  await s.plugin.createNote();
  assert.equal(s.source, 'Current/note.md');
  assert.equal(s.files.get('Notes/Untitled.md').content, 'keep');
  assert.equal(s.opened[0].file.path, 'Notes/Untitled 2.md');
  assert.equal(s.opened[0].state.state.mode, 'source');
  assert.ok(s.focused);
  assert.equal(s.notices.length, 0);
});

test('root destination and no active file work', async () => {
  const s = setup(); s.ready();
  s.app.workspace.getActiveFile = () => null;
  s.app.fileManager.getNewFileParent = path => { assert.equal(path, ''); return { path: '/' }; };
  await s.plugin.createNote(); assert.ok(s.files.has('Untitled.md'));
});

test('rapid taps create only one note', async () => {
  const s = setup(); s.ready();
  await Promise.all([s.plugin.createNote(), s.plugin.createNote()]);
  assert.equal(s.files.size, 1); assert.equal(s.buttons[0].disabled, false);
});

test('creation errors restore the button and permit retry', async () => {
  const s = setup(); s.ready(); const create = s.app.vault.create;
  s.app.vault.create = async () => { throw new Error('write failed'); };
  await s.plugin.createNote();
  assert.equal(s.notices.length, 1); assert.equal(s.buttons[0].disabled, false);
  s.app.vault.create = create; await s.plugin.createNote(); assert.equal(s.opened.length, 1);
});

test('open failure preserves the created file and explains the result', async () => {
  const s = setup(); s.ready();
  s.leaf.openFile = async () => { throw new Error('open failed'); };
  await s.plugin.createNote();
  assert.equal(s.files.size, 1); assert.match(s.notices[0], /was created/);
  assert.equal(s.buttons[0].disabled, false);
});

test('unload during creation does not open a note or recreate UI', async () => {
  const s = setup(); s.ready();
  const pending = s.plugin.createNote(); s.unload(); await pending;
  assert.equal(s.opened.length, 0); assert.equal(s.buttons.length, 0);
});
