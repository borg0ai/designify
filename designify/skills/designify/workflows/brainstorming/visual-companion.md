# Visual Companion Guide

Browser-based visual brainstorming companion for showing mockups, diagrams, and options.

## When to Use

Decide per-question, not per-session. The test: **would the user understand this better by seeing it than reading it?**

**Use the browser** when the content itself is visual:

- **UI mockups** — wireframes, layouts, navigation structures, component designs
- **Architecture diagrams** — system components, data flow, relationship maps
- **Side-by-side visual comparisons** — comparing two layouts, two color schemes, two design directions
- **Design polish** — when the question is about look and feel, spacing, visual hierarchy
- **Spatial relationships** — state machines, flowcharts, entity relationships rendered as diagrams

**Use the terminal** when the content is text or tabular:

- **Requirements and scope questions** — "what does X mean?", "which features are in scope?"
- **Conceptual A/B/C choices** — picking between approaches described in words
- **Tradeoff lists** — pros/cons, comparison tables
- **Technical decisions** — API design, data modeling, architectural approach selection
- **Clarifying questions** — anything where the answer is words, not a visual preference

A question *about* a UI topic is not automatically a visual question. "What kind of wizard do you want?" is conceptual — use the terminal. "Which of these wizard layouts feels right?" is visual — use the browser.

## How It Works

The companion is the published npm package `@borg0ai/brainstorm-server`. Run it with `npx -y @borg0ai/brainstorm-server@6.5.0` from the user's project. The version is pinned to the one that ships with this plugin, so a plugin release always drives a matching CLI. The first run resolves the package through the npm registry and caches it; later runs start from cache. Without a registry, `npx` fails loudly and there is no visual companion — say so rather than pretending the screen is up.

`start` serves one HTML file. Write that file first, then start. The process keeps running after the parent exits. Clicks with a non-empty `choice` are appended to `.designify/brainstorm/events`. The file is served as you wrote it. There is no directory watch and no frame wrapper.

## Starting a Session

```bash
# Write the screen file first. Run from the user's project root.
npx -y @borg0ai/brainstorm-server@6.5.0 start --screen path/to/screen.html

# {"type":"ready","url":"http://localhost:<port>/?key=<token>","port":<port>,"pid":<pid>,"serverId":"<id>"}
```

Give the user the complete `url` from that line, including `?key=`. A request without the key is rejected.

State defaults to `.designify/brainstorm/` under the current working directory. `server.json` there has the same ready payload. `.designify/` belongs in `.gitignore`.

If the environment reaps detached processes, add `--foreground` and background the tool call:

```bash
npx -y @borg0ai/brainstorm-server@6.5.0 start --screen path/to/screen.html --foreground
```

The server binds `127.0.0.1` only.

## The Loop

1. **Write one HTML file**, then **start** (or restart) the CLI with `--screen` pointing at it.
   - Use semantic filenames: `platform.html`, `visual-style.html`, `layout.html`.
   - Use your file-creation tool. Do not cat or heredoc the HTML into the terminal.
   - A new screen is a new `start`. Stop the previous process first. The URL changes.
2. **Tell the user what is on the screen and end your turn.** Repeat the full URL. Ask them to look and reply in the terminal.
3. **On your next turn**, read `.designify/brainstorm/events` if it exists. Merge those JSON lines with what they typed. The terminal message is the primary feedback.
4. **Iterate or advance.** A changed screen is a new file and a new `start`. Move on only after this step is validated.
5. **Leave the browser** when the next step is text. `npx -y @borg0ai/brainstorm-server@6.5.0 stop`. Continue in the terminal.
6. Repeat until done.

## Writing the Screen

The CLI returns the file bytes unchanged. Write a complete HTML document, including its own CSS. A click records a choice only when the page sends a WebSocket text frame whose JSON has a non-empty `choice` string. Use the page URL with `http` replaced by `ws` so the `?key=` is kept.

**Minimal example:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Layout</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    .option { cursor: pointer; padding: 1rem; border: 1px solid #ccc; margin: 0.5rem 0; }
    .option.selected { outline: 2px solid #333; }
  </style>
</head>
<body>
  <h2>Which layout works better?</h2>
  <div class="option" data-choice="single">Single column</div>
  <div class="option" data-choice="split">Two column</div>
  <script>
    const socket = new WebSocket(location.href.replace(/^http/, "ws"));
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-choice]");
      if (!target) return;
      document.querySelectorAll("[data-choice]").forEach((node) => node.classList.remove("selected"));
      target.classList.add("selected");
      const payload = JSON.stringify({ choice: target.dataset.choice });
      if (socket.readyState === WebSocket.OPEN) socket.send(payload);
    });
  </script>
</body>
</html>
```

Put layout, cards, and comparisons in that document. The server does not add CSS or a click script.

## Browser Events Format

Each choice is appended as one JSON line in `.designify/brainstorm/events`. The file is not cleared when you start again.

```jsonl
{"type":"choice","choice":"single"}
{"type":"choice","choice":"split"}
```

Read lines written since your last turn. The last `choice` is the latest click. If the file is missing, the user did not click — use their terminal text.

## Design Tips

- **Scale fidelity to the question** — wireframes for layout, polish for polish questions
- **Explain the question on each page** — "Which layout feels more professional?" not just "Pick one"
- **Iterate before advancing** — if feedback changes current screen, write a new version
- **2-4 options max** per screen
- **Use real content when it matters** — for a photography portfolio, use actual images (Unsplash). Placeholder content obscures design issues.
- **Keep mockups simple** — focus on layout and structure, not pixel-perfect design

## File Naming

- Use semantic names: `platform.html`, `visual-style.html`, `layout.html`
- Never reuse filenames — each screen must be a new file
- For iterations: append version suffix like `layout-v2.html`, `layout-v3.html`
- Server serves the file passed to `brainstorm start --screen`. A new version is a new file and a new start.

## Cleaning Up

```bash
npx -y @borg0ai/brainstorm-server@6.5.0 stop
```

Mockup files you wrote stay on disk. `stop` removes `server.json` and `server.pid` under `.designify/brainstorm/`.
