import { initRuntime } from "@intentlang/core";
import { exitCodeFrom, summarize } from "../../diagnostics/exit-code.js";
import { processFiles, emitFiles } from "./helpers.js";
import { printBuildSummary, handleJsonOutput } from "./output.js";
import { printDiagnostics, printWatchStatus } from "../../term/output.js";
import type { BuildFlags } from "./types.js";

export async function runBuild(
  files: string[],
  flags: BuildFlags,
): Promise<void> {
  initRuntime({
    seedRng: flags.seedRng ? Number(flags.seedRng) : undefined,
    seedClock: flags.seedClock ? Number(flags.seedClock) : undefined,
  });

  const { programs, diagnostics, sources } = processFiles(files);
  const { errors, warnings } = summarize(diagnostics);
  const code = exitCodeFrom(diagnostics, { strict: flags.strict });

  if (flags.json) {
    const built = code === 0 ? emitFiles(programs, flags) : [];
    handleJsonOutput({ flags, diagnostics, errors, warnings, built, code });
    return;
  }

  printDiagnostics(diagnostics, sources);

  const built = code === 0 ? emitFiles(programs, flags) : [];
  printBuildSummary(errors, warnings, !!flags.strict, built.length);

  if (!flags.watch) {
    process.exitCode = code;
  } else {
    printWatchStatus({ errors, warnings, strict: !!flags.strict });
  }
}
