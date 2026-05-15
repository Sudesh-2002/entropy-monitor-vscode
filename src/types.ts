export interface EntropyResult {
  overallScore: number;
  couplingScore: number;
  duplicationScore: number;
  deadcodeScore: number;
  totalFiles: number;
  totalLines: number;
  unusedExports: number;
  unusedFiles: number;
  scannedAt: number;
  error?: string;
}

export const emptyResult = (): EntropyResult => ({
  overallScore: 0,
  couplingScore: 0,
  duplicationScore: 0,
  deadcodeScore: 0,
  totalFiles: 0,
  totalLines: 0,
  unusedExports: 0,
  unusedFiles: 0,
  scannedAt: Date.now(),
});