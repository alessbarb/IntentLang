import { initRuntime } from "@intentlang/core";
import { exitCodeFrom, summarize } from "../../diagnostics/exit-code.js";
import { executeTests } from "./helpers.js";
import { printHumanResults, printTestSummary } from "./output.js";
import { printDiagnostics, printWatchStatus } from "../../term/output.js";
import { handleJsonOutput } from "../../utils/output.js";
import type { TestFlags } from "./types.js";
import { processFiles } from "../../utils/files.js";

/**
 * Execute the test command for a set of files.
 */
export async function runTest(files: string[], flags: TestFlags) {
  initRuntime({
    seedRng: flags.seedRng !== undefined ? Number(flags.seedRng) : undefined,
    seedClock:
      flags.seedClock !== undefined ? Number(flags.seedClock) : undefined,
  });

  const { programs, diagnostics, sources } = processFiles(files);
  const { errors, warnings } = summarize(diagnostics);
  const preCode = exitCodeFrom(diagnostics, { strict: flags.strict });

  const isJsonOutput = flags.json || flags.reporter === "json";

  const results = await executeTests(programs, flags);
  const failed = results.some((r) => !r.ok);
  const finalExit = failed ? 1 : preCode;

  if (isJsonOutput) {
    handleJsonOutput({
      kind: "test",
      flags,
      errors,
      warnings,
      diagnostics,
      tests: results,
      code: finalExit,
    });
  } else {
    printDiagnostics(diagnostics, sources, flags.maxErrors);
    printHumanResults(results);
    printTestSummary(results, diagnostics);

    if (!flags.watch) {
      process.exitCode = finalExit;
    } else {
      printWatchStatus({
        errors,
        warnings,
        strict: !!flags.strict,
      });
    }
  }
}
