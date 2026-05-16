# Codebase Entropy — VS Code Extension

> Your codebase has a heartbeat. This extension shows it.

Codebase Entropy monitors your project for signs of disorder — tangled imports, copy-pasted code, and dead exports — and surfaces a **live health score** right in your VS Code status bar. No terminal needed.

![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/sudeshhansika.codebase-entropy?style=flat-square&color=7c3aed)
![Installs](https://img.shields.io/visual-studio-marketplace/i/sudeshhansika.codebase-entropy?style=flat-square)
![Rating](https://img.shields.io/visual-studio-marketplace/r/sudeshhansika.codebase-entropy?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## Install

Search **Codebase Entropy** in the VS Code Extensions panel (`Ctrl+Shift+X`), or install from the terminal:

```bash
code --install-extension sudeshhansika.codebase-entropy
```

---

## What it measures

| Signal | What it detects |
|---|---|
| **Coupling** | Import graph analysis — which files depend on too many others |
| **Duplication** | AST-based clone detection — copy-pasted blocks across files |
| **Dead code** | Unused exports, unused files, and unresolved imports |

Each signal scores **0–100**. Lower is healthier. They average into one **Overall Entropy** score shown in your status bar at all times.

---

## Supported languages

Auto-detected from your project files — no configuration needed.

| Language | Coupling | Duplication | Dead code |
|---|---|---|---|
| TypeScript | ✅ | ✅ | ✅ |
| JavaScript | ✅ | ✅ | ✅ |
| Python | ✅ | ✅ | — |
| Java | ✅ | ✅ | — |
| Go | ✅ | ✅ | — |
| Ruby | ✅ | ✅ | — |
| C / C++ | ✅ | ✅ | — |

Override auto-detection via the `entropyMonitor.languages` setting.

---

## Features

- **Live status bar score** — see your entropy score at a glance without leaving your editor
- **Colour-coded health** — green under 30, yellow under 60, red above 60
- **Grade system** — A+ to F grade alongside the score
- **Sidebar health dashboard** — score cards for all four metrics with colour-coded progress bars
- **Detailed stat table** — total lines, unused exports, unused files, duplicate blocks, unresolved imports
- **Auto-scan on open** — scans your workspace a few seconds after VS Code loads
- **Debounced file watcher** — re-scans automatically 5 seconds after you stop making changes (when scan-on-save is enabled)
- **One-click HTML report** — generates a full interactive Chart.js dashboard and opens it in your browser
- **Command palette integration** — trigger scans manually at any time
- **Multi-language support** — TypeScript, JavaScript, Python, Java, Go, Ruby, C/C++

---

## How it works

```
VS Code workspace opens
        ↓
Extension activates (detects .ts / .js / .py / .java / .go / .rb / .cpp files)
        ↓
Runs: npx entropy-monitor scan /your/project --no-save --json
        ↓
Parses JSON output — coupling, duplication, dead code scores
        ↓
Updates status bar + sidebar dashboard instantly
```

The extension shells out to the [entropy-monitor CLI](https://www.npmjs.com/package/entropy-monitor). The analysis engine stays up to date independently of the extension via npm.

---

## Status bar

The status bar item at the bottom of VS Code shows your score at all times:

| Display | Meaning |
|---|---|
| `♥ Entropy: 18/100` in green | Healthy — score below 30 |
| `⚠ Entropy: 52/100` in yellow | Some disorder building up — score 30–60 |
| `✗ Entropy: 78/100` in red | Needs attention — score above 60 |
| `⟳ Entropy…` spinning | Scan in progress |

Click the status bar item to trigger a manual re-scan.

---

## Sidebar dashboard

Open the **Codebase Entropy** icon in the activity bar (left sidebar) to see:

- Large overall score with letter grade (A+ to F)
- Four score cards: Coupling, Duplication, Dead code, Files
- Stat table: total lines, unused exports, unused files, duplicate blocks, unresolved imports
- Last scan time
- Scan Now button
- Open HTML Report button

---

## Commands

Open the Command Palette (`Ctrl+Shift+P`) and search:

| Command | Description |
|---|---|
| `Entropy Monitor: Scan Workspace` | Run a full scan immediately |
| `Entropy Monitor: Show Report` | Generate and open the HTML dashboard in your browser |

---

## Settings

Open Settings (`Ctrl+,`) and search **Entropy Monitor**:

| Setting | Default | Description |
|---|---|---|
| `entropyMonitor.autoScan` | `true` | Scan automatically when workspace opens |
| `entropyMonitor.scanOnSave` | `false` | Re-scan 5 seconds after the last file save |
| `entropyMonitor.skipDuplication` | `false` | Skip duplication analysis for faster scans |
| `entropyMonitor.skipDeadcode` | `false` | Skip dead code analysis for faster scans |
| `entropyMonitor.languages` | `""` | Languages to scan — leave empty for auto-detect |

### Language override examples

In your VS Code `settings.json`:

```json
{
  "entropyMonitor.languages": "python",
  "entropyMonitor.skipDuplication": false,
  "entropyMonitor.scanOnSave": true
}
```

```json
{
  "entropyMonitor.languages": "typescript,python",
  "entropyMonitor.skipDeadcode": true
}
```

---

## Requirements

- VS Code 1.85 or higher
- Node.js 20 or higher
- Internet access for the first run (`npx` downloads `entropy-monitor` automatically)

No global install required — `npx` handles it on first use.

---

## Performance tips

For large codebases (1000+ files), scans can take 30–60 seconds due to duplication analysis. Speed it up:

```json
{
  "entropyMonitor.skipDuplication": true,
  "entropyMonitor.scanOnSave": false
}
```

This reduces scan time to under 5 seconds in most projects.

---

## Privacy

All analysis runs **entirely on your local machine**. No code, file names, or metrics are ever sent to any server. The extension only communicates with VS Code APIs and the local `entropy-monitor` CLI process.

---

## Companion CLI

The full CLI tool gives you history tracking, HTML reports, diffs, and CI gates:

```bash
npm install -g entropy-monitor

entropy-monitor scan .
entropy-monitor history .
entropy-monitor diff .
entropy-monitor report .
entropy-monitor ci . --max-overall 70
```

Install it: [npmjs.com/package/entropy-monitor](https://www.npmjs.com/package/entropy-monitor)

---

## License

MIT © Sudesh Hansika

---

## Links

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sudeshhansika.codebase-entropy)
- [CLI on npm](https://www.npmjs.com/package/entropy-monitor)
- [GitHub — Extension](https://github.com/sudesh-2002/entropy-monitor-vscode)
- [GitHub — CLI](https://github.com/sudesh-2002/entropy-monitor)
- [Report an issue](https://github.com/sudeshhansika/entropy-monitor-vscode/issues)
