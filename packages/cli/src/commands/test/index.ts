import { initRuntime } from "@il/core";
import { exitCodeFrom, summarize } from "../../diagnostics/exit-code.js";
import { processFiles, executeTests } from "./helpers.js";
import {
  printHumanResults,
  printTestSummary,
  handleJsonOutput,
} from "./output.js";
import { printDiagnostics, printWatchStatus } from "../../term/output.js";
import type { TestFlags } from "./types.js";

export async function runTest(files: string[], flags: TestFlags) {
  initRuntime({
    seedRng: flags.seedRng ? Number(flags.seedRng) : undefined,
    seedClock: flags.seedClock ? Number(flags.seedClock) : undefined,
  });

  const { programs, diagnostics, sources } = processFiles(files);
  const counts = summarize(diagnostics);
  const preCode = exitCodeFrom(diagnostics, { strict: flags.strict });

  const isJsonOutput = flags.json || flags.reporter === "json";

  const results = await executeTests(programs, flags);
  const failed = results.some((r) => !r.ok);
  const finalExit = failed ? 1 : preCode;

  if (isJsonOutput) {
    handleJsonOutput({
      flags,
      counts,
      diagnostics,
      results,
      exitCode: finalExit,
    });
  } else {
    printDiagnostics(diagnostics, sources);
    printHumanResults(results);
    printTestSummary(results, diagnostics);

    if (!flags.watch) {
      process.exitCode = finalExit;
    } else {
      printWatchStatus({
        errors: counts.errors,
        warnings: counts.warnings,
        strict: !!flags.strict,
      });
    }
  }
}
