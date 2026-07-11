var import_obsidian = require("obsidian");

const DEFAULT_SETTINGS = {
  embedHeight: 300
};

var WebEmbedSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h3", { text: "How to use" });
    const instructions = containerEl.createEl("div");
    instructions.style.cssText = "margin-bottom:1.5em;padding:12px 14px;background:var(--background-secondary);border-radius:6px;font-size:13px;line-height:1.6;";
    instructions.innerHTML = `
      Create a <code>browser</code> code block in any note and put the URL on its own
      line:<br><br>
      <code style="display:block;white-space:pre;background:var(--background-primary);padding:8px 10px;border-radius:4px;">\`\`\`browser\nhttps://example.com\n\`\`\`</code><br>
      The page loads as a live, interactive view inside the note.<br><br>
      <strong>Note:</strong> Some sites block embedding — if you see ⚠️ Could not load page,
      the site is preventing iframes.
    `;

    containerEl.createEl("h3", { text: "Settings" });

    new import_obsidian.Setting(containerEl)
      .setName("Embed height (px)")
      .setDesc("Default height of the embedded browser view in pixels.")
      .addText((text) =>
        text
          .setPlaceholder("300")
          .setValue(String(this.plugin.settings.embedHeight))
          .onChange(async (value) => {
            const parsed = parseInt(value);
            if (!isNaN(parsed) && parsed > 0) {
              this.plugin.settings.embedHeight = parsed;
              await this.plugin.saveSettings();
            }
          })
      );
  }
};

var WebEmbedPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new WebEmbedSettingTab(this.app, this));

    this.addCommand({
      id: "insert-browser-block",
      name: "Insert browser embed",
      editorCallback: (editor) => {
        const snippet = "```browser\nhttps://\n```";
        const cursor = editor.getCursor();
        editor.replaceRange(snippet, cursor);
        editor.setCursor({ line: cursor.line + 1, ch: 8 });
      }
    });

    this.registerMarkdownCodeBlockProcessor("browser", (source, el, ctx) => {
      const url = source.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        el.createEl("p", { text: "Invalid URL — must start with http:// or https://" });
        return;
      }
      this.renderWebview(el, url);
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  renderWebview(container, url) {
    const height = `${this.settings.embedHeight}px`;
    container.style.cssText = `width:100%;height:${height};position:relative;`;

    const webview = document.createElement("webview");
    webview.setAttribute("src", url);
    webview.style.cssText = `width:100%;height:${height};border:none;`;

    const fallback = document.createElement("div");
    fallback.style.cssText = `position:absolute;top:0;left:0;width:100%;height:${height};display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:13px;background:var(--background-secondary);`;
    fallback.textContent = "Loading…";

    webview.addEventListener("did-finish-load", () => fallback.remove());
    webview.addEventListener("did-fail-load", () => {
      fallback.textContent = "⚠️ Could not load page.";
    });

    container.appendChild(fallback);
    container.appendChild(webview);
  }

  async onunload() {}
};

module.exports = WebEmbedPlugin;
