import { colors } from "../../term/colors.js";
import type { TestFlags, TestResult, Diagnostic } from "./types.js";
import { summarize } from "../../diagnostics/exit-code.js";

/** Imprime los resultados de los tests en formato legible. */
export function printHumanResults(results: TestResult[]): void {
  for (const result of results) {
    if (result.ok) {
      console.log(`${colors.green("✓")} ${result.name}`);
    } else {
      console.error(`\n${colors.red("✗")} ${colors.bold(result.name)}`);
      console.error(colors.gray(result.error || "Unknown error"));
    }
  }
}

/** Imprime un resumen final de la ejecución de tests. */
export function printTestSummary(
  results: TestResult[],
  diagnostics: Diagnostic[],
) {
  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  const { errors, warnings } = summarize(diagnostics);

  console.log("\n" + colors.bold("Test Summary"));
  console.log(
    `  Tests: ${
      failed > 0 ? colors.red(`${failed} failed, `) : ""
    }${colors.green(`${passed} passed, `)}${results.length} total`,
  );

  if (errors > 0 || warnings > 0) {
    console.log(
      `  Diagnostics: ${(colors.red(`${errors} error(s)`), colors.yellow(`${warnings} warning(s)`))}`,
    );
  }
}

/** Gestiona la salida JSON. */
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
    diags: diagnostics,
    tests: results,
    exitCode,
  };
  process.stdout.write(JSON.stringify(output) + "\n");
  process.exitCode = exitCode;
}
