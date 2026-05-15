import * as vscode from 'vscode';
import type { EntropyResult } from './types';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private lastResult?: EntropyResult;
  private isScanning = false;

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'scan')   vscode.commands.executeCommand('entropyMonitor.scan');
      if (msg.command === 'report') vscode.commands.executeCommand('entropyMonitor.showReport');
    });
  }

  setScanning() {
    this.isScanning = true;
    this.refresh();
  }

  update(result: EntropyResult) {
    this.isScanning = false;
    this.lastResult = result;
    this.refresh();
  }

  private refresh() {
    if (this.view) {
      this.view.webview.html = this.getHtml();
    }
  }

  private getHtml(): string {
    const r = this.lastResult;
    const score = r?.overallScore ?? null;
    const color = score === null ? '#6b7280'
      : score < 30 ? '#22c55e'
      : score < 60 ? '#eab308' : '#ef4444';

    const card = (label: string, value: number | null, suffix = '') => {
      const c = value === null ? '#6b7280'
        : value < 30 ? '#22c55e'
        : value < 60 ? '#eab308' : '#ef4444';
      const pct = Math.min(100, value ?? 0);
      return `
        <div class="card">
          <div class="card-label">${label}</div>
          <div class="card-value" style="color:${c}">${value ?? '—'}${suffix}</div>
          <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%;background:${c}"></div></div>
        </div>`;
    };

    const statRow = (label: string, value: string | number) =>
      `<div class="stat-row"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`;

    const ts = r ? new Date(r.scannedAt).toLocaleTimeString() : 'Never';
    const scanning = this.isScanning;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: var(--vscode-font-family); font-size: 12px; color: var(--vscode-foreground); padding: 8px; margin: 0; background: transparent; }
  .hero { text-align: center; padding: 16px 0 10px; }
  .hero-score { font-size: 52px; font-weight: 700; line-height: 1; color: ${color}; transition: color 0.3s; }
  .hero-label { font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
  .scanning { font-size: 11px; color: var(--vscode-descriptionForeground); text-align: center; margin-bottom: 8px; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 8px; }
  .card { background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 6px; padding: 7px 8px; }
  .card-label { font-size: 9px; color: var(--vscode-descriptionForeground); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.06em; }
  .card-value { font-size: 22px; font-weight: 700; line-height: 1; margin-bottom: 5px; }
  .bar-wrap { background: var(--vscode-editorWidget-border); border-radius: 2px; height: 3px; }
  .bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
  .stats { background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 6px; padding: 8px; margin-bottom: 8px; }
  .stat-row { display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px solid var(--vscode-editorWidget-border); }
  .stat-row:last-child { border-bottom: none; }
  .stat-label { color: var(--vscode-descriptionForeground); font-size: 11px; }
  .stat-value { font-weight: 500; font-size: 11px; }
  .meta { font-size: 10px; color: var(--vscode-descriptionForeground); margin-bottom: 8px; text-align: center; }
  button { width: 100%; padding: 6px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-bottom: 5px; }
  .btn-primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .btn-primary:hover { background: var(--vscode-button-hoverBackground); }
  .btn-secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
  .error { color: var(--vscode-errorForeground); font-size: 11px; padding: 6px; background: var(--vscode-inputValidation-errorBackground); border-radius: 4px; margin-bottom: 8px; }
  .grade { display: inline-block; font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 4px; margin-left: 6px; background: ${color}22; color: ${color}; }
</style>
</head>
<body>

<div class="hero">
  <div class="hero-score">
    ${scanning ? '…' : (score ?? '—')}
    ${!scanning && score !== null ? `<span class="grade">${grade(score)}</span>` : ''}
  </div>
  <div class="hero-label">Overall entropy score</div>
</div>

${scanning ? '<div class="scanning">⚡ Scanning workspace…</div>' : ''}
${r?.error ? `<div class="error">⚠ ${r.error}</div>` : ''}

<div class="cards">
  ${card('Coupling', r?.couplingScore ?? null)}
  ${card('Duplication', r?.duplicationScore ?? null)}
  ${card('Dead code', r?.deadcodeScore ?? null)}
  ${card('Files', r?.totalFiles ?? null)}
</div>

${r && !r.error ? `
<div class="stats">
  ${statRow('Total lines', r.totalLines.toLocaleString())}
  ${statRow('Unused exports', r.unusedExports)}
  ${statRow('Unused files', r.unusedFiles)}
  ${statRow('Duplicate blocks', r.duplicateBlocks)}
  ${statRow('Unresolved imports', r.unresolvedImports)}
</div>` : ''}

<div class="meta">Last scan: ${ts}</div>

<button class="btn-primary" onclick="scan()" ${scanning ? 'disabled' : ''}>
  ${scanning ? 'Scanning…' : '⚡ Scan Now'}
</button>
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

function grade(score: number): string {
  if (score < 20) return 'A+';
  if (score < 30) return 'A';
  if (score < 40) return 'B+';
  if (score < 50) return 'B';
  if (score < 60) return 'C';
  if (score < 75) return 'D';
  return 'F';
}