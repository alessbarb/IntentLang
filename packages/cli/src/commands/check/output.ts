import { colors } from "../../term/colors.js";
import type { GlobalFlags } from "../../flags.js";
import type { Diagnostic } from "./types.js";

/** Imprime un resumen final del proceso de validación. */
export function printCheckSummary(
  errorCount: number,
  warningCount: number,
  isStrict: boolean,
) {
  if (errorCount > 0) {
    console.error(
      colors.red(colors.bold(`Check failed with ${errorCount} error(s).`)),
    );
  } else if (isStrict && warningCount > 0) {
    console.error(
      colors.yellow(
        colors.bold(
          `Check failed due to ${warningCount} warning(s) in strict mode.`,
        ),
      ),
    );
  } else {
    console.log(colors.green("Check passed."));
    if (warningCount > 0) {
      console.log(colors.yellow(`(${warningCount} warning(s) found)`));
    }
  }
}

/** Gestiona la salida JSON. */
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
