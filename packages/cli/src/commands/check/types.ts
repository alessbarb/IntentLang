import type { Diagnostic as CoreDiagnostic } from "@intentlang/core";

/**
 * Diagnostic enriched with an optional normalized file path.
 */
export type Diagnostic = CoreDiagnostic & { file?: string };

/**
 * Entry stored in the file check cache.
 */
export type CacheEntry = {
  /** Last modification time in milliseconds. */
  mtimeMs: number;
  /** Diagnostics produced for this file. */
  diags: Diagnostic[];
};
