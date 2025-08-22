// utils/types.ts
import type { Diagnostic as CoreDiagnostic } from "@intentlang/core";

export type CliDiagnostic = CoreDiagnostic & { file?: string };

export type ProgramInfo = {
  file: string;
  program: any;
};

export type JsonOutput = {
  kind: "build" | "check" | "test";
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
  message?: string;
};
