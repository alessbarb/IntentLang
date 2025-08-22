import { colors } from "../../term/colors.js";
import type { TestResult, Diagnostic } from "./types.js";
import { summarize } from "../../diagnostics/exit-code.js";

/**
 * Print test results in a readable format.
 */
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

/**
 * Print a summary after running tests.
 */
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
    const parts = [];
    if (errors > 0) parts.push(colors.red(`${errors} error(s)`));
    if (warnings > 0) parts.push(colors.yellow(`${warnings} warning(s)`));
    console.log(`  Diagnostics: ${parts.join(", ")}`);
  }
}
