import { execSync } from 'child_process';
import * as vscode from 'vscode';
import type { EntropyResult } from './types';

export async function runScan(workspacePath: string): Promise<EntropyResult> {
  const config = vscode.workspace.getConfiguration('entropyMonitor');
  const skipDup  = config.get<boolean>('skipDuplication') ? '--skip-duplication' : '';
  const skipDead = config.get<boolean>('skipDeadcode')    ? '--skip-deadcode'    : '';

  const langConfig = config.get<string>('languages') ?? '';
  const langFlag = langConfig.trim() ? `--lang "${langConfig.trim()}"` : '';
  const cmd = `npx entropy-monitor scan "${workspacePath}" ${skipDup} ${skipDead} ${langFlag} --no-save --json`
    .replace(/\s+/g, ' ')
    .trim();

  let stdout = '';
  let stderr = '';

  try {
    stdout = execSync(cmd, {
      cwd: workspacePath,
      encoding: 'utf-8',
      timeout: 120_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err: unknown) {
    if (isExecError(err)) {
      stdout = err.stdout ?? '';
      stderr = err.stderr ?? '';
    }
    if (!stdout.trim()) {
      return errorResult(`Scan failed: ${stderr || String(err)}`);
    }
  }

  return parseJsonOutput(stdout);
}

function parseJsonOutput(output: string): EntropyResult {
  // Find the JSON line — ignore any non-JSON lines (warnings etc.)
  const lines = output.trim().split('\n');
  for (const line of lines.reverse()) {
    const trimmed = line.trim();
    if (trimmed.startsWith('{')) {
      try {
        const json = JSON.parse(trimmed);
        return {
          overallScore:     json.overallScore     ?? 0,
          couplingScore:    json.couplingScore    ?? 0,
          duplicationScore: json.duplicationScore ?? 0,
          deadcodeScore:    json.deadcodeScore    ?? 0,
          totalFiles:       json.totalFiles       ?? 0,
          totalLines:       json.totalLines       ?? 0,
          unusedExports:    json.unusedExports    ?? 0,
          unusedFiles:      json.unusedFiles      ?? 0,
          duplicateBlocks:  json.duplicateBlocks  ?? 0,
          unresolvedImports: json.unresolvedImports ?? 0,
          scannedAt:        json.scannedAt        ?? Date.now(),
        };
      } catch {
        continue;
      }
    }
  }
  return errorResult('Could not parse scan output — is entropy-monitor installed?');
}

function errorResult(msg: string): EntropyResult {
  return {
    overallScore: 0, couplingScore: 0, duplicationScore: 0, deadcodeScore: 0,
    totalFiles: 0, totalLines: 0, unusedExports: 0, unusedFiles: 0,
    duplicateBlocks: 0, unresolvedImports: 0,
    scannedAt: Date.now(), error: msg,
  };
}

function isExecError(e: unknown): e is { stdout: string; stderr: string } {
  return typeof e === 'object' && e !== null && 'stdout' in e;
}