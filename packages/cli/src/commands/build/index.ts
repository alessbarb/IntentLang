import { initRuntime, type Diagnostic } from "@il/core";
import { exitCodeFrom, summarize } from "../../diagnostics/exit-code.js";
import { processFiles, emitFiles } from "./helpers.js";
import {
  printDiagnostics,
  printWatchStatus,
  handleJsonOutput,
} from "./output.js";
import type { BuildFlags } from "./types.js";

export async function runBuild(
  files: string[],
  flags: BuildFlags,
): Promise<void> {
  initRuntime({
    seedRng: flags.seedRng ? Number(flags.seedRng) : undefined,
    seedClock: flags.seedClock ? Number(flags.seedClock) : undefined,
  });

  const { programs, diagnostics } = processFiles(files);
  const { errors, warnings } = summarize(diagnostics);
  const code = exitCodeFrom(diagnostics, { strict: flags.strict });

  if (flags.json) {
    const built = code === 0 ? emitFiles(programs, flags) : [];
    handleJsonOutput({ flags, diagnostics, errors, warnings, built, code });
    return;
  }

  printDiagnostics(diagnostics);

  if (code !== 0) {
    if (errors === 0 && warnings > 0 && flags.strict) {
      console.error("Build failed due to warnings (strict).");
    }
    if (!flags.watch) {
      process.exitCode = code;
    } else {
      printWatchStatus({ errors, warnings, strict: !!flags.strict });
    }
    return;
  }

  const built = emitFiles(programs, flags);

  if (!flags.watch) {
    for (const f of built) console.log(`Built: ${f}`);
    process.exitCode = 0;
  } else {
    printWatchStatus({ errors, warnings, strict: !!flags.strict });
  }
}
