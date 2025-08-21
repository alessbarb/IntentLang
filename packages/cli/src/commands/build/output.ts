import { colors } from "../../term/colors.js";
import type { Diagnostic } from "@intentlang/core";
import type { BuildFlags } from "./types.js";

/** Imprime un resumen final del proceso de construcción. */
export function printBuildSummary(
  errorCount: number,
  warningCount: number,
  isStrict: boolean,
  builtFileCount: number,
) {
  if (errorCount > 0) {
    console.error(
      colors.red(colors.bold(`Build failed with ${errorCount} error(s).`)),
    );
  } else if (isStrict && warningCount > 0) {
    console.error(
      colors.yellow(
        colors.bold(
          `Build failed due to ${warningCount} warning(s) in strict mode.`,
        ),
      ),
    );
  } else {
    console.log(
      colors.green(`Build succeeded. ${builtFileCount} file(s) emitted.`),
    );
    if (warningCount > 0) {
      console.log(colors.yellow(`(${warningCount} warning(s) found)`));
    }
  }
}

/** Gestiona la salida JSON. */
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
    diags: diagnostics,
    built,
    exitCode: code,
  };
  process.stdout.write(JSON.stringify(output) + "\n");
  process.exitCode = code;
}
