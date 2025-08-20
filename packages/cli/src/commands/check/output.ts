import { severityOf } from "../../diagnostics/exit-code.js";
import type { GlobalFlags } from "../../flags.js";
import type { Diagnostic } from "./types.js";

/** Imprime diagnósticos formateados a `stderr`. */
export function printDiagnostics(diags: Diagnostic[], maxErrors?: number) {
  let errorsPrinted = 0;
  let totalErrors = 0;

  for (const d of diags) {
    const sev = severityOf(d as any);
    if (sev === "error") {
      totalErrors++;
      if (maxErrors !== undefined && errorsPrinted >= maxErrors) continue;
      errorsPrinted++;
    }

    const where = (d as any).span
      ? ` at ${(d as any).span.start.line}:${(d as any).span.start.column}`
      : "";
    const tag =
      sev === "error" ? "[ERROR]" : sev === "warning" ? "[WARN ]" : "[INFO ]";
    const file = d.file ? `${d.file}: ` : "";
    console.error(`${file}${tag} ${d.message}${where}`);
  }

  if (maxErrors !== undefined && totalErrors > errorsPrinted) {
    console.error(`+${totalErrors - errorsPrinted} errors not shown`);
  }
}

/** Imprime el estado en modo `--watch`. */
export function printWatchStatus(info: {
  errors: number;
  warnings: number;
  strict: boolean;
}) {
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
  global,
  diagnostics,
  errors,
  warnings,
  code,
  message,
}: {
  global: GlobalFlags;
  diagnostics: Diagnostic[];
  errors: number;
  warnings: number;
  code: number;
  message?: string;
}): void {
  const output = {
    kind: "check",
    meta: { strict: !!global.strict, watch: !!global.watch },
    counts: { errors, warnings },
    diagnostics,
    status: code === 0 ? "ok" : "error",
    diags: diagnostics,
    exitCode: code,
    ...(message && { message }),
  };
  process.stdout.write(JSON.stringify(output) + "\n");
}
