// Refactorization Notes:
// Integrated watch mode with chokidar and used the new unified JSON output.

import { initRuntime } from "@intentlang/core";
import { exitCodeFrom, summarize } from "../../diagnostics/exit-code.js";
import { processFiles, isIlFile } from "./helpers.js";
import { emitFiles } from "./helpers.js";
import { printBuildSummary } from "./output.js";
import { printDiagnostics, printWatchStatus } from "../../term/output.js";
import { handleJsonOutput } from "../../utils/output.js";
import { setupWatcher } from "../../utils/watch.js";
import type { BuildFlags } from "./types.js";

async function doBuildPass(files: string[], flags: BuildFlags) {
  initRuntime({
    seedRng: flags.seedRng ? Number(flags.seedRng) : undefined,
    seedClock: flags.seedClock ? Number(flags.seedClock) : undefined,
  });

  const ilFiles = files.filter(isIlFile);
  const { programs, diagnostics, sources } = processFiles(ilFiles);
  const { errors, warnings } = summarize(diagnostics);
  const code = exitCodeFrom(diagnostics, { strict: flags.strict });

  if (flags.json) {
    const built = code === 0 ? emitFiles(programs, flags) : [];
    handleJsonOutput({
      kind: "build",
      flags,
      diagnostics,
      errors,
      warnings,
      built,
      code,
    });
    return;
  }

  printDiagnostics(diagnostics, sources, flags.maxErrors);

  const built = code === 0 ? emitFiles(programs, flags) : [];
  printBuildSummary(errors, warnings, !!flags.strict, built.length);

  if (!flags.watch) {
    process.exitCode = code;
  } else {
    printWatchStatus({ errors, warnings, strict: !!flags.strict });
  }
}

export async function runBuild(
  files: string[],
  flags: BuildFlags,
): Promise<void> {
  await doBuildPass(files, flags);
  if (flags.watch) {
    setupWatcher(files, () => doBuildPass(files, flags));
  }
}
