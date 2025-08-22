/**
 * Utilities to format JSON output consistently across CLI commands.
 */

import type { Diagnostic } from "@intentlang/core";
import type { BuildFlags } from "../commands/build/types.js";
import type { GlobalFlags } from "../flags.js";
import type { TestResult } from "../commands/test/types.js";
import type { CliDiagnostic, JsonOutput } from "./types.js";

type CommandFlags = GlobalFlags & Partial<BuildFlags>;

/**
 * Print structured JSON output and set the appropriate exit code.
 */
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
  diagnostics: CliDiagnostic[];
  errors: number;
  warnings: number;
  code: number;
  built?: string[];
  tests?: TestResult[];
  message?: string;
}): void {
  const output: JsonOutput = {
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
    ...(built && { built }),
    ...(tests && { tests }),
    ...(message && { message }),
    exitCode: code,
  };
  process.stdout.write(JSON.stringify(output) + "\n");
  process.exitCode = code;
}
