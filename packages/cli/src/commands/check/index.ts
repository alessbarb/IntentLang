import fs from "node:fs";
import path from "node:path";
import { parse, check as checkProgram } from "@il/core";
import type { GlobalFlags } from "../../flags.js";
import { exitCodeFrom, summarize } from "../../diagnostics/exit-code.js";
import { readStdin, checkFiles, expandInputs } from "./helpers.js";
import {
  printDiagnostics,
  printWatchStatus,
  handleJsonOutput,
} from "./output.js";
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
    if (code === 0) console.log("OK");
  }
  process.exitCode = code;
}

function setupWatcher(doPass: () => Promise<void>, files: string[]) {
  let timer: NodeJS.Timeout | null = null;
  const debounceMs = 200;
  const roots = new Set<string>();
  const GLOB_RE = /[*?\[]/;

  for (const p of files) {
    if (/[*?\[]/.test(p)) {
      const norm = p.split(/[\\/]/).join("/");
      const firstStar = norm.search(GLOB_RE);
      const baseNorm =
        firstStar > 0
          ? norm.slice(0, norm.lastIndexOf("/", firstStar) + 1)
          : ".";
      const baseFs = baseNorm.split("/").join(path.sep) || ".";
      roots.add(path.resolve(baseFs));
    } else {
      const st = fs.existsSync(p) ? fs.statSync(p) : null;
      roots.add(
        st?.isDirectory() ? path.resolve(p) : path.dirname(path.resolve(p)),
      );
    }
  }

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void doPass(), debounceMs);
  };

  for (const r of roots) {
    try {
      fs.watch(r, { recursive: true }, schedule);
    } catch {
      fs.watch(r, {}, schedule); // Fallback for systems without recursive watch
    }
  }

  const poll = setInterval(schedule, 2000); // Keep-alive polling
  process.on("SIGINT", () => {
    clearInterval(poll);
    if (timer) clearTimeout(timer);
    process.exit(0); // Ctrl+C should exit with 0
  });
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
        if (code === 0) console.log("OK");
      } else {
        if (code === 1 && errors === 0 && warnings > 0 && global.strict) {
          console.error("Build failed due to warnings (strict).");
        }
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
