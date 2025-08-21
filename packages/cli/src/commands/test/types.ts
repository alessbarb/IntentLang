import type { GlobalFlags } from "../../flags.js";
import type { Diagnostic as CoreDiagnostic } from "@intentlang/core";

export type Diagnostic = CoreDiagnostic;

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

export type ProgramInfo = {
  file: string;
  program: any;
};
