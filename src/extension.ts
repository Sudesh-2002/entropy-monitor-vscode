import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { runScan } from './scanner';
import { EntropyStatusBar } from './statusBar';
import { SidebarProvider } from './sidebarProvider';

let statusBar: EntropyStatusBar;
let sidebar: SidebarProvider;
let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  statusBar = new EntropyStatusBar();
  sidebar = new SidebarProvider();
  diagnosticCollection = vscode.languages.createDiagnosticCollection('entropy-monitor');

  // Register sidebar
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('entropyMonitor.sidebar', sidebar)
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('entropyMonitor.scan', async () => {
      const root = getWorkspaceRoot();
      if (!root) {
        vscode.window.showWarningMessage('Entropy Monitor: No workspace folder open.');
        return;
      }

      statusBar.setScanning();
      vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Entropy Monitor scanning…', cancellable: false },
        async () => {
          const result = await runScan(root);
          statusBar.setResult(result);
          sidebar.update(result);

          if (result.error) {
            statusBar.setError();
            vscode.window.showErrorMessage(`Entropy Monitor error: ${result.error}`);
          } else {
            const msg = `Entropy: ${result.overallScore}/100 — Coupling: ${result.couplingScore}, Dup: ${result.duplicationScore}, Dead: ${result.deadcodeScore}`;
            vscode.window.showInformationMessage(msg);
          }
        }
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('entropyMonitor.showReport', async () => {
      const root = getWorkspaceRoot();
      if (!root) return;

      const { execSync } = require('child_process');
      const outPath = path.join(root, 'entropy-report.html');
      try {
        execSync(`npx entropy-monitor report "${root}" --out "${outPath}"`, { cwd: root });
        const uri = vscode.Uri.file(outPath);
        vscode.env.openExternal(uri);
      } catch {
        vscode.window.showErrorMessage('Failed to generate entropy report.');
      }
    })
  );

  context.subscriptions.push(statusBar, diagnosticCollection);

  // Auto-scan on startup
  const config = vscode.workspace.getConfiguration('entropyMonitor');
  if (config.get<boolean>('autoScan')) {
    setTimeout(() => {
      vscode.commands.executeCommand('entropyMonitor.scan');
    }, 3000);
  }

  // Scan on save
  if (config.get<boolean>('scanOnSave')) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(() => {
        vscode.commands.executeCommand('entropyMonitor.scan');
      })
    );
  }
}

export function deactivate() {
  statusBar?.dispose();
  diagnosticCollection?.dispose();
}

function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}