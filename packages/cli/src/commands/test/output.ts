import { severityOf } from "../../diagnostics/exit-code.js";
import type { TestFlags, TestResult, Diagnostic } from "./types.js";

/** Imprime diagnósticos a `stderr`. */
export function printDiagnostics(diags: Diagnostic[]): void {
  for (const d of diags) {
    const where = (d as any).span
      ? ` at ${(d as any).span.start.line}:${(d as any).span.start.column}`
      : "";
    const sev = severityOf(d as any);
    const tag =
      sev === "error" ? "[ERROR]" : sev === "warning" ? "[WARN ]" : "[INFO ]";
    console.error(`${tag} ${(d as any).message}${where}`);
  }
}

/** Imprime los resultados de los tests en formato legible para humanos. */
export function printHumanResults(results: TestResult[]): void {
  for (const result of results) {
    if (result.ok) {
      console.log(`✓ ${result.name}`);
    } else {
      console.error(`✗ ${result.name}:`, result.error);
    }
  }
}

/** Imprime el estado en modo `--watch`. */
export function printWatchStatus(info: {
  errors: number;
  warnings: number;
  strict: boolean;
}): void {
  const cause =
    info.errors > 0
      ? "errors"
      : info.strict && info.warnings > 0
        ? "warnings (strict)"
        : "clean";
  console.error(
    `[watch] ${info.errors} error(s), ${info.warnings} warning(s) — ${cause}`,
  );
}

/** Gestiona la salida JSON, escribiendo a `stdout`. */
export function handleJsonOutput({
  flags,
  counts,
  diagnostics,
  results,
  exitCode,
}: {
  flags: TestFlags;
  counts: { errors: number; warnings: number };
  diagnostics: Diagnostic[];
  results: TestResult[];
  exitCode: number;
}): void {
  const output = {
    kind: "test",
    meta: { strict: !!flags.strict },
    counts,
    diagnostics,
    status: exitCode === 0 ? "ok" : "error",
    diags: diagnostics, // For legacy compatibility
    tests: results,
    exitCode,
  };
  process.stdout.write(JSON.stringify(output) + "\n");
  process.exitCode = exitCode;
}
