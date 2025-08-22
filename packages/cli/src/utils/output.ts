// Refactorization Notes:
// Unifies JSON output logic to reduce redundancy across commands.

import type { Diagnostic } from "@intentlang/core";
import type { BuildFlags } from "../commands/build/types.js";
import type { GlobalFlags } from "../flags.js";
import type { TestResult } from "../commands/test/types.js";

type CommandFlags = GlobalFlags & Partial<BuildFlags>;

export function handleJsonOutput({
  kind,
  flags,
  diagnostics,
  errors,
  warnings,
  code,
  built,
  tests,
  message,
}: {
  kind: "build" | "check" | "test";
  flags: CommandFlags;
  diagnostics: Diagnostic[];
  errors: number;
  warnings: number;
  code: number;
  built?: string[];
  tests?: TestResult[];
  message?: string;
}): void {
  const output = {
    kind,
    meta: {
      strict: !!flags.strict,
      watch: !!flags.watch,
      ...(flags.target && { target: flags.target }),
      ...(flags.outDir && { outDir: flags.outDir }),
    },
    counts: { errors, warnings },
    diagnostics,
    status: code === 0 ? "ok" : "error",
    diags: diagnostics,
    ...(built && { built }),
    ...(tests && { tests }),
    ...(message && { message }),
    exitCode: code,
  };
  process.stdout.write(JSON.stringify(output) + "\n");
  process.exitCode = code;
}
