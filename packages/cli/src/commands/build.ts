import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import {
  parse,
  check as checkProgram,
  emitTypeScript,
  initRuntime,
  type Diagnostic,
} from "@il/core";
import type { GlobalFlags } from "../flags.js";
import {
  exitCodeFrom,
  summarize,
  severityOf,
} from "../diagnostics/exit-code.js";

// Types and Flags
// =============================================================================

export type BuildFlags = GlobalFlags & {
  target: "ts" | "js";
  outDir: string;
  sourcemap?: boolean;
};

type ProgramInfo = {
  file: string;
  program: any;
};

// Helper Functions (Pure)
// =============================================================================

/** Checks if a path corresponds to an `.il` file. */
function isIlFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile() && /\.il$/i.test(p);
  } catch {
    return false;
  }
}

/** Processes input files, parsing and checking each one. */
function processFiles(files: string[]): {
  programs: ProgramInfo[];
  diagnostics: Diagnostic[];
} {
  const diagnostics: Diagnostic[] = [];
  const programs = files
    .filter(isIlFile)
    .map((file) => {
      const src = fs.readFileSync(file, "utf8");
      if (/^\s*$/.test(src)) return null;
      const program = parse(src);
      diagnostics.push(...checkProgram(program));
      return { file, program };
    })
    .filter((p): p is ProgramInfo => p !== null);

  return { programs, diagnostics };
}

/** Writes the output files (TS or JS) to the destination directory. */
function emitFiles(programs: ProgramInfo[], flags: BuildFlags): string[] {
  fs.mkdirSync(flags.outDir, { recursive: true });
  const built: string[] = [];

  for (const { file, program } of programs) {
    const tsCode = emitTypeScript(program);
    const baseName = path.basename(file).replace(/\.il$/i, "");
    const destPath = (ext: string) =>
      path.join(flags.outDir, `${baseName}${ext}`);

    if (flags.target === "ts") {
      const dest = destPath(".ts");
      fs.writeFileSync(dest, tsCode, "utf8");
      built.push(dest);
    } else if (flags.target === "js") {
      const js = ts.transpileModule(tsCode, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          sourceMap: !!flags.sourcemap,
        },
      });
      const dest = destPath(".js");
      fs.writeFileSync(dest, js.outputText, "utf8");
      built.push(dest);

      if (flags.sourcemap && js.sourceMapText) {
        fs.writeFileSync(destPath(".js.map"), js.sourceMapText, "utf8");
      }
    }
  }
  return built;
}

// Effectful Functions (Console/Process Output)
// =============================================================================

/** Prints diagnostics to `stderr`. */
function printDiagnostics(diags: Diagnostic[]): void {
  for (const d of diags) {
    const where = (d as any).span
      ? ` at ${(d as any).span.start.line}:${(d as any).span.start.column}`
      : "";
    const sev = severityOf(d as any);
    const tag =
      sev === "error" ? "[ERROR]" : sev === "warning" ? "[WARN ]" : "[INFO ]";
    console.error(`${tag} ${(d as any).message}${where}`);
  }
}

/** Prints the status in `--watch` mode. */
function printWatchStatus(info: {
  errors: number;
  warnings: number;
  strict: boolean;
}): void {
  const cause =
    info.errors > 0
      ? "errors"
      : info.strict && info.warnings > 0
        ? "warnings (strict)"
        : "clean";
  console.error(
    `[watch] ${info.errors} error(s), ${info.warnings} warning(s) — ${cause}`,
  );
}

/** Handles JSON output, writing to `stdout`. */
function handleJsonOutput({
  flags,
  diagnostics,
  errors,
  warnings,
  built,
  code,
}: {
  flags: BuildFlags;
  diagnostics: Diagnostic[];
  errors: number;
  warnings: number;
  built: string[];
  code: number;
}): void {
  const output = {
    kind: "build",
    meta: {
      strict: !!flags.strict,
      target: flags.target,
      outDir: flags.outDir,
    },
    counts: { errors, warnings },
    diagnostics,
    status: code === 0 ? "ok" : "error",
    diags: diagnostics, // For legacy compatibility
    built,
    exitCode: code,
  };
  process.stdout.write(JSON.stringify(output) + "\n");
  process.exitCode = code;
}

// Main Function
// =============================================================================

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
