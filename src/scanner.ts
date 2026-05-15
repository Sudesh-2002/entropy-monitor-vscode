import { execSync } from 'child_process';
import * as vscode from 'vscode';
import type { EntropyResult } from './types';

export async function runScan(workspacePath: string): Promise<EntropyResult> {
  const config = vscode.workspace.getConfiguration('entropyMonitor');
  const skipDup = config.get<boolean>('skipDuplication') ? '--skip-duplication' : '';
  const skipDead = config.get<boolean>('skipDeadcode') ? '--skip-deadcode' : '';

  const cmd = `npx entropy-monitor scan "${workspacePath}" ${skipDup} ${skipDead} --no-save`.trim();

  let output = '';
  try {
    output = execSync(cmd, {
      cwd: workspacePath,
      encoding: 'utf-8',
      timeout: 120_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err: unknown) {
    if (isExecError(err)) output = err.stdout ?? '';
    else return errorResult(String(err));
  }

  return parseOutput(output);
}

function parseOutput(output: string): EntropyResult {
  const num = (label: string): number => {
    const match = output.match(new RegExp(`${label}[:\\s]+(\\d+)`));
    return match ? parseInt(match[1], 10) : 0;
  };

  // Parse scores from CLI output lines like "Overall entropy:   18/100"
  const overallMatch  = output.match(/Overall entropy[:\s]+(\d+)\/100/);
  const couplingMatch = output.match(/Coupling score[:\s]+(\d+)\/100/);
  const dupMatch      = output.match(/Duplication score[:\s]+(\d+)\/100/);
  const deadMatch     = output.match(/Dead code score[:\s]+(\d+)\/100/);

  return {
    overallScore:      overallMatch  ? parseInt(overallMatch[1])  : 0,
    couplingScore:     couplingMatch ? parseInt(couplingMatch[1]) : 0,
    duplicationScore:  dupMatch      ? parseInt(dupMatch[1])      : 0,
    deadcodeScore:     deadMatch     ? parseInt(deadMatch[1])     : 0,
    totalFiles:        num('Files scanned'),
    totalLines:        num('Total lines'),
    unusedExports:     num('Unused exports'),
    unusedFiles:       num('Unused files'),
    scannedAt:         Date.now(),
  };
}

function errorResult(msg: string): EntropyResult {
  return {
    overallScore: 0, couplingScore: 0, duplicationScore: 0, deadcodeScore: 0,
    totalFiles: 0, totalLines: 0, unusedExports: 0, unusedFiles: 0,
    scannedAt: Date.now(), error: msg,
  };
}

function isExecError(e: unknown): e is { stdout: string } {
  return typeof e === 'object' && e !== null && 'stdout' in e;
}