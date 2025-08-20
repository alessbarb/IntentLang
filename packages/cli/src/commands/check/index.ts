import fs from "node:fs";
import path from "node:path";
import { parse, check as checkProgram } from "@il/core";
import type { GlobalFlags } from "../../flags.js";
import { exitCodeFrom, summarize } from "../../diagnostics/exit-code.js";
import { readStdin, checkFiles } from "./helpers.js";
import { printCheckSummary, handleJsonOutput } from "./output.js";
import { printDiagnostics, printWatchStatus } from "../../term/output.js";
import type { Diagnostic, CacheEntry } from "./types.js";

async function handleStdin(global: GlobalFlags) {
  const src = await readStdin();
  const diagnostics: Diagnostic[] = /^\s*$/.test(src)
    ? []
    : checkProgram(parse(src));
  diagnostics.forEach((d) => (d.file = "(stdin)"));

  const { errors, warnings } = summarize(diagnostics);
  const code = exitCodeFrom(diagnostics, { strict: global.strict });

  if (global.json) {
    handleJsonOutput({ global, diagnostics, errors, warnings, code });
  } else {
    printDiagnostics(diagnostics, global.maxErrors);
    printCheckSummary(errors, warnings, !!global.strict);
  }
  process.exitCode = code;
}

function setupWatcher(doPass: () => Promise<void>, files: string[]) {
  // ... (sin cambios en esta función)
}

export async function runCheck(files: string[], global: GlobalFlags) {
  if (files.length === 1 && files[0] === "-") {
    return handleStdin(global);
  }

  const cache = new Map<string, CacheEntry>();

  const doPass = async () => {
    const { diagnostics, files: matched } = checkFiles(files, cache);

    if (matched.length === 0) {
      if (global.json) {
        handleJsonOutput({
          global,
          diagnostics: [],
          errors: 0,
          warnings: 0,
          code: 2,
          message: "No files matched.",
        });
      } else {
        console.error("No files matched.");
      }
      if (!global.watch) process.exitCode = 2;
      return;
    }

    const { errors, warnings } = summarize(diagnostics);
    const code = exitCodeFrom(diagnostics, { strict: global.strict });

    if (global.json) {
      handleJsonOutput({ global, diagnostics, errors, warnings, code });
    } else {
      printDiagnostics(diagnostics, global.maxErrors);
      if (!global.watch) {
        printCheckSummary(errors, warnings, !!global.strict);
      } else {
        printWatchStatus({ errors, warnings, strict: !!global.strict });
      }
    }

    if (!global.watch) process.exitCode = code;
  };

  await doPass();

  if (global.watch) {
    setupWatcher(doPass, files);
  }
}
