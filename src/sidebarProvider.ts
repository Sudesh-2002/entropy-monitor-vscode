import * as vscode from 'vscode';
import type { EntropyResult } from './types';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private lastResult?: EntropyResult;

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml(this.lastResult);

    webviewView.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'scan') {
        vscode.commands.executeCommand('entropyMonitor.scan');
      }
      if (msg.command === 'report') {
        vscode.commands.executeCommand('entropyMonitor.showReport');
      }
    });
  }

  update(result: EntropyResult) {
    this.lastResult = result;
    if (this.view) {
      this.view.webview.html = this.getHtml(result);
    }
  }

  private getHtml(result?: EntropyResult): string {
    const score = result?.overallScore ?? null;
    const color = score === null ? '#6b7280'
      : score < 30 ? '#22c55e'
      : score < 60 ? '#eab308'
      : '#ef4444';

    const card = (label: string, value: number | null) => {
      const c = value === null ? '#6b7280'
        : value < 30 ? '#22c55e'
        : value < 60 ? '#eab308' : '#ef4444';
      const pct = value ?? 0;
      return `
        <div class="card">
          <div class="card-label">${label}</div>
          <div class="card-value" style="color:${c}">${value ?? '—'}</div>
          <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%;background:${c}"></div></div>
        </div>`;
    };

    const ts = result ? new Date(result.scannedAt).toLocaleTimeString() : 'Never';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body { font-family: var(--vscode-font-family); font-size: 12px; color: var(--vscode-foreground); padding: 8px; margin: 0; background: transparent; }
  .hero { text-align: center; padding: 16px 0 12px; }
  .hero-score { font-size: 48px; font-weight: 700; line-height: 1; color: ${color}; }
  .hero-label { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 4px; }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
  .card { background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 6px; padding: 8px; }
  .card-label { font-size: 10px; color: var(--vscode-descriptionForeground); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
  .card-value { font-size: 20px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
  .bar-wrap { background: var(--vscode-editorWidget-border); border-radius: 2px; height: 3px; }
  .bar-fill { height: 100%; border-radius: 2px; }
  .meta { font-size: 10px; color: var(--vscode-descriptionForeground); margin-bottom: 10px; }
  .meta span { margin-right: 8px; }
  button { width: 100%; padding: 6px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-bottom: 6px; }
  .btn-primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .btn-primary:hover { background: var(--vscode-button-hoverBackground); }
  .btn-secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
  .error { color: var(--vscode-errorForeground); font-size: 11px; padding: 6px; background: var(--vscode-inputValidation-errorBackground); border-radius: 4px; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="hero">
  <div class="hero-score">${score ?? '—'}</div>
  <div class="hero-label">Overall entropy score</div>
</div>
${result?.error ? `<div class="error">${result.error}</div>` : ''}
<div class="cards">
  ${card('Coupling', result?.couplingScore ?? null)}
  ${card('Duplication', result?.duplicationScore ?? null)}
  ${card('Dead code', result?.deadcodeScore ?? null)}
  ${card('Files', result?.totalFiles ?? null)}
</div>
<div class="meta">
  <span>Scanned: ${ts}</span>
  ${result ? `<span>${result.totalLines.toLocaleString()} lines</span>` : ''}
</div>
<button class="btn-primary" onclick="scan()">Scan Now</button>
<button class="btn-secondary" onclick="report()">Open HTML Report</button>
<script>
  const vscode = acquireVsCodeApi();
  function scan()   { vscode.postMessage({ command: 'scan' }); }
  function report() { vscode.postMessage({ command: 'report' }); }
</script>
</body>
</html>`;
  }
}