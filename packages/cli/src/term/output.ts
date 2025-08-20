// packages/cli/src/term/output.ts

import path from "node:path";
import type { Diagnostic } from "@il/core";
import { severityOf } from "../diagnostics/exit-code.js";
import { colors } from "./colors.js";

/**
 * Imprime diagnósticos a `stderr` con un formato mejorado y colores.
 * @param diags - La lista de diagnósticos a imprimir.
 * @param maxErrors - El número máximo de errores a mostrar.
 */
export function printDiagnostics(
  diags: Diagnostic[],
  maxErrors?: number,
): void {
  if (diags.length === 0) return;

  let errorsPrinted = 0;
  const totalErrors = diags.filter(
    (d) => severityOf(d as any) === "error",
  ).length;

  for (const d of diags) {
    const sev = severityOf(d as any);
    if (sev === "error") {
      if (maxErrors !== undefined && errorsPrinted >= maxErrors) continue;
      errorsPrinted++;
    }

    const tag =
      sev === "error" ? colors.red("[ERROR]") : colors.yellow("[WARNING]");
    const location = (d as any).span
      ? colors.cyan(
          `${path.basename((d as any).file ?? "")}:${(d as any).span.start.line}:${(d as any).span.start.column}`,
        )
      : colors.cyan((d as any).file ?? "");

    console.error(`\n${tag} ${colors.bold(d.message)}`);
    console.error(`  ${colors.gray("-->")} ${location}`);
  }

  if (maxErrors !== undefined && totalErrors > errorsPrinted) {
    console.error(
      `\n${colors.yellow(`+${totalErrors - errorsPrinted} more error(s) not shown.`)}`,
    );
  }
  console.error(); // Línea en blanco para separar
}

/**
 * Imprime el estado en modo `--watch`.
 */
export function printWatchStatus(info: {
  errors: number;
  warnings: number;
  strict: boolean;
}): void {
  const { errors, warnings, strict } = info;
  let statusMessage: string;

  if (errors > 0) {
    statusMessage = colors.red(`${errors} error(s)`);
  } else if (strict && warnings > 0) {
    statusMessage = colors.yellow(`${warnings} warning(s) (strict)`);
  } else if (warnings > 0) {
    statusMessage = colors.yellow(`${warnings} warning(s)`);
  } else {
    statusMessage = colors.green("clean");
  }

  const time = new Date().toLocaleTimeString();
  console.error(
    colors.gray(`[${time}]`),
    `Watching for changes... Status: ${statusMessage}`,
  );
}
