# Entropy Monitor — VS Code Extension

> Your codebase has a heartbeat. This extension shows it.

Entropy Monitor watches your TypeScript project for signs of disorder — tangled imports, copy-pasted code, and dead exports — and surfaces a live health score right in your status bar.

![VS Code Status Bar](https://img.shields.io/badge/entropy-18%2F100-22c55e?style=flat-square)
![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/sudeshhansika.entropy-monitor-vscode?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## What it measures

| Signal | What it detects |
|---|---|
| **Coupling** | Import graph analysis — which files depend on too many others |
| **Duplication** | AST-based clone detection — copy-pasted blocks across the codebase |
| **Dead code** | Unused exports and unreachable files — code nobody calls |

Each signal scores 0–100. Lower is healthier. They average into one **Overall Entropy** score shown in your status bar at all times.

---

## Features

- **Live status bar score** — see entropy at a glance without leaving your editor
- **Sidebar health dashboard** — four score cards with colour-coded bars, file counts, and scan history
- **Auto-scan on open** — scans your workspace 3 seconds after VS Code loads
- **Scan on save** — optional continuous monitoring as you write code
- **One-click HTML report** — generates a full interactive Chart.js dashboard and opens it in your browser
- **Command palette integration** — run scans manually anytime

---

## Installation

Search **Entropy Monitor** in the VS Code Extensions panel, or install directly:

```bash
code --install-extension sudeshhansika.entropy-monitor-vscode
```

Requires [entropy-monitor](https://www.npmjs.com/package/entropy-monitor) to be available via `npx` (no global install needed).

---

## Usage

Once installed, open any TypeScript project. The extension activates automatically.

| What you see | What it means |
|---|---|
| `♥ Entropy: 18/100` in green | Healthy codebase |
| `⚠ Entropy: 52/100` in yellow | Some disorder building up |
| `✗ Entropy: 78/100` in red | Needs attention |

Click the status bar item to trigger a manual scan.

Open the **Entropy Monitor** icon in the activity bar to see the full breakdown.

---

## Commands

Open the Command Palette (`Ctrl+Shift+P`) and search:

| Command | Description |
|---|---|
| `Entropy Monitor: Scan Workspace` | Run a full scan immediately |
| `Entropy Monitor: Show Report` | Generate and open the HTML dashboard |

---

## Settings

| Setting | Default | Description |
|---|---|---|
| `entropyMonitor.autoScan` | `true` | Scan automatically when workspace opens |
| `entropyMonitor.scanOnSave` | `false` | Re-scan every time a file is saved |
| `entropyMonitor.skipDuplication` | `false` | Skip duplication analysis for faster scans |
| `entropyMonitor.skipDeadcode` | `false` | Skip dead code analysis for faster scans |

---

## How it works

```
VS Code workspace opens
        ↓
Extension activates (workspaceContains: **/*.ts)
        ↓
Runs: npx entropy-monitor scan /your/project --no-save
        ↓
Parses scores from CLI output
        ↓
Updates status bar + sidebar dashboard
```

The extension shells out to the [entropy-monitor CLI](https://www.npmjs.com/package/entropy-monitor) — a separate npm package that does the actual analysis. This means the analysis engine stays up to date independently of the extension.

---

## Related

- [entropy-monitor](https://www.npmjs.com/package/entropy-monitor) — the CLI tool this extension wraps
- [GitHub repository](https://github.com/yourusername/entropy-monitor-vscode)

---

## License

MIT © Sudesh Hansika
