import { MarkdownView, Notice, Platform, Plugin, normalizePath, setIcon } from "obsidian";

export default class NewNoteButtonPlugin extends Plugin {
  private button: HTMLButtonElement | null = null;
  private creating = false;
  private unloaded = false;

  onload(): void {
    this.unloaded = false;
    if (!Platform.isIosApp) return;

    this.app.workspace.onLayoutReady(() => {
      if (this.unloaded || this.button) return;

      const button = document.createElement("button");
      button.className = "new-note-button";
      button.type = "button";
      button.setAttribute("aria-label", "Create new note");
      button.title = "Create new note";
      setIcon(button, "plus");
      this.registerDomEvent(button, "click", () => { void this.createNote(); });
      document.body.appendChild(button);
      this.button = button;
    });
  }

  onunload(): void {
    this.unloaded = true;
    this.button?.remove();
    this.button = null;
  }

  private async createNote(): Promise<void> {
    if (this.creating || this.unloaded) return;
    this.creating = true;
    const button = this.button;
    if (button) button.disabled = true;
    let created = false;

    try {
      const { workspace, fileManager, vault } = this.app;
      const parent = fileManager.getNewFileParent(workspace.getActiveFile()?.path ?? "");
      let suffix = 0;
      let path: string;
      do {
        const name = suffix === 0 ? "Untitled" : `Untitled ${suffix}`;
        path = normalizePath(`${parent.path}/${name}.md`);
        suffix++;
      } while (vault.getAbstractFileByPath(path));

      // Vault.create rejects existing paths, including collisions after the check.
      const file = await vault.create(path, "");
      created = true;
      if (this.unloaded) return;
      const leaf = workspace.getLeaf(false);
      await leaf.openFile(file, { active: true, state: { mode: "source" } });
      if (!this.unloaded && leaf.view instanceof MarkdownView) leaf.view.editor.focus();
    } catch (error) {
      console.error("New Note Button: failed to create or open a note", error);
      if (!this.unloaded) {
        new Notice(created
          ? "The note was created, but could not be opened. Find it in the file explorer."
          : "Could not create a new note. Please try again.");
      }
    } finally {
      this.creating = false;
      if (button) button.disabled = false;
    }
  }
}
