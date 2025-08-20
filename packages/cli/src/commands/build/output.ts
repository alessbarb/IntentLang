import type { Diagnostic } from "@il/core";
import { severityOf } from "../../diagnostics/exit-code.js";
import type { BuildFlags } from "./types.js";

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
  diagnostics,
  errors,
  warnings,
  built,
  code,
}: {
  flags: BuildFlags;
  diagnostics: Diagnostic[];
  errors: number;
  warnings: number;
  built: string[];
  code: number;
}): void {
  const output = {
    kind: "build",
    meta: {
      strict: !!flags.strict,
      target: flags.target,
      outDir: flags.outDir,
    },
    counts: { errors, warnings },
    diagnostics,
    status: code === 0 ? "ok" : "error",
    diags: diagnostics, // For legacy compatibility
    built,
    exitCode: code,
  };
  process.stdout.write(JSON.stringify(output) + "\n");
  process.exitCode = code;
}
