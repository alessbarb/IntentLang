import { initRuntime } from "@il/core";
import { exitCodeFrom, summarize } from "../../diagnostics/exit-code.js";
import { processFiles, executeTests } from "./helpers.js";
import {
  printDiagnostics,
  printHumanResults,
  printWatchStatus,
  handleJsonOutput,
} from "./output.js";
import type { TestFlags } from "./types.js";

export async function runTest(files: string[], flags: TestFlags) {
  initRuntime({
    seedRng: flags.seedRng ? Number(flags.seedRng) : undefined,
    seedClock: flags.seedClock ? Number(flags.seedClock) : undefined,
  });

  const { programs, diagnostics } = processFiles(files);
  const counts = summarize(diagnostics);
  const preCode = exitCodeFrom(diagnostics, { strict: flags.strict });

  const isJsonOutput = flags.json || flags.reporter === "json";

  if (!isJsonOutput) {
    printDiagnostics(diagnostics);
    if (
      preCode === 1 &&
      counts.errors === 0 &&
      counts.warnings > 0 &&
      flags.strict
    ) {
      console.error("Build failed due to warnings (strict).");
    }
  }

  const results = await executeTests(programs, flags);

  if (!isJsonOutput) {
    printHumanResults(results);
  }

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
