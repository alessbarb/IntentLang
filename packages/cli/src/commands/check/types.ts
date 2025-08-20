import type { Diagnostic as CoreDiagnostic } from "@il/core";

export type Diagnostic = CoreDiagnostic & { file?: string };

export type CacheEntry = {
  mtimeMs: number;
  diags: Diagnostic[];
};
