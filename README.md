# Web Embed

Embed any website as a live, interactive browser view inside an Obsidian note.

## Usage

Create a fenced code block with the language tag `browser` and put the URL on its own line:

```browser
https://example.com
```

The site loads inside the note at the configured height. You can scroll, click, and interact with it just like a normal browser tab.

## Settings

Open Settings → Web Embed to configure:

| Setting | Default | Description |
| --- | --- | --- |
| Embed height (px) | 300 | Height of the embedded browser view |

## Notes

- Desktop only — Obsidian's `<webview>` element is not available on mobile.
- URLs must begin with `https://` or `http://`. An inline error is shown otherwise.
- Some sites block embedding via `X-Frame-Options` or `Content-Security-Policy`; if a page shows ⚠️ Could not load page, the site is blocking the embed.
