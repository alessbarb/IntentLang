import type { Diagnostic as CoreDiagnostic } from "@intentlang/core";

/**
 * Extension of core diagnostics with optional file information for CLI outputs.
 */
export type CliDiagnostic = CoreDiagnostic & { file?: string };

/**
 * Program information loaded by the CLI.
 */
export type ProgramInfo = {
  file: string;
  program: any;
};

/**
 * Structured JSON shape emitted by CLI commands.
 */
export type JsonOutput = {
  kind: "build" | "check" | "test" | "init";
  meta: {
    strict: boolean;
    watch: boolean;
    target?: "ts" | "js";
    outDir?: string;
  };
  counts: { errors: number; warnings: number };
  diagnostics: CliDiagnostic[];
  status: "ok" | "error";
  exitCode: number;
  built?: string[];
  tests?: { name: string; ok: boolean; error?: string }[];
  created?: string[];
  message?: string;
};
