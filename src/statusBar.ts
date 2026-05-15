import * as vscode from 'vscode';
import type { EntropyResult } from './types';

export class EntropyStatusBar {
  private item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left, 100
    );
    this.item.command = 'entropyMonitor.scan';
    this.item.tooltip = 'Click to run Entropy Monitor scan';
    this.setScanning();
    this.item.show();
  }

  setScanning() {
    this.item.text = '$(sync~spin) Entropy…';
    this.item.backgroundColor = undefined;
  }

  setResult(result: EntropyResult) {
    const score = result.overallScore;
    const icon = score < 30 ? '$(heart)' : score < 60 ? '$(warning)' : '$(error)';
    this.item.text = `${icon} Entropy: ${score}/100`;
    this.item.backgroundColor = score >= 70
      ? new vscode.ThemeColor('statusBarItem.errorBackground')
      : undefined;
    this.item.tooltip =
      `Overall: ${score}/100\n` +
      `Coupling: ${result.couplingScore}/100\n` +
      `Duplication: ${result.duplicationScore}/100\n` +
      `Dead code: ${result.deadcodeScore}/100\n` +
      `\nClick to re-scan`;
  }

  setError() {
    this.item.text = '$(error) Entropy: error';
    this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
  }

  dispose() {
    this.item.dispose();
  }
}