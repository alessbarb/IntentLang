import fs from "node:fs";
import path from "node:path";
import { parse, check as checkProgram } from "@intentlang/core";
import type { GlobalFlags } from "../../flags.js";
import { exitCodeFrom, summarize } from "../../diagnostics/exit-code.js";
import { readStdin, checkFiles } from "./helpers.js";
import { printCheckSummary } from "./output.js";
import { printDiagnostics, printWatchStatus } from "../../term/output.js";
import { handleJsonOutput } from "../../utils/output.js";
import { setupWatcher } from "../../utils/watch.js";
import type { Diagnostic, CacheEntry } from "./types.js";
import { failUsage } from "../../utils/cli-error.js";

async function handleStdin(global: GlobalFlags) {
  const src = await readStdin();
  const diagnostics: Diagnostic[] = /^\s*$/.test(src)
    ? []
    : checkProgram(parse(src));
  diagnostics.forEach((d) => (d.file = "(stdin)"));

  const { errors, warnings } = summarize(diagnostics);
  const code = exitCodeFrom(diagnostics, { strict: global.strict });

  if (global.json) {
    handleJsonOutput({
      kind: "check",
      flags: global,
      diagnostics,
      errors,
      warnings,
      code,
    });
  } else {
    const sources = new Map([["(stdin)", src]]);
    printDiagnostics(diagnostics, sources, global.maxErrors);
    printCheckSummary(errors, warnings, !!global.strict);
  }
  process.exitCode = code;
}

async function doCheckPass(
  files: string[],
  global: GlobalFlags,
  cache: Map<string, CacheEntry>,
) {
  const { diagnostics, files: matched, sources } = checkFiles(files, cache);

  if (matched.length === 0) {
    try {
      failUsage(global, "ILC0402", "No files matched.");
    } catch {}
    return;
  }

  const { errors, warnings } = summarize(diagnostics);
  const code = exitCodeFrom(diagnostics, { strict: global.strict });

  if (global.json) {
    handleJsonOutput({
      kind: "check",
      flags: global,
      diagnostics,
      errors,
      warnings,
      code,
    });
  } else {
    printDiagnostics(diagnostics, sources, global.maxErrors);
    if (!global.watch) {
      printCheckSummary(errors, warnings, !!global.strict);
    } else {
      printWatchStatus({ errors, warnings, strict: !!global.strict });
    }
  }

  if (!global.watch) process.exitCode = code;
}

/**
 * Execute the check command on a set of files or standard input.
 */
export async function runCheck(files: string[], global: GlobalFlags) {
  if (files.length === 1 && files[0] === "-") {
    return handleStdin(global);
  }

  const cache = new Map<string, CacheEntry>();
  await doCheckPass(files, global, cache);

  if (global.watch) {
    setupWatcher(files, () => doCheckPass(files, global, cache));
  }
}
