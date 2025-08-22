// Refactorization Notes:
// Removed py from target as it is not implemented.

import type { GlobalFlags } from "../../flags.js";
import type { CliDiagnostic } from "../../utils/types.js";

export type Diagnostic = CliDiagnostic;

export type TestFlags = GlobalFlags & {
  only?: string;
  bail?: boolean;
  reporter?: "json" | "human";
};

export type TestResult = {
  name: string;
  ok: boolean;
  error?: string;
};
