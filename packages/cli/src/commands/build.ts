import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import {
  parse,
  check as checkProgram,
  emitTypeScript,
  initRuntime,
} from "@il/core";
import type { GlobalFlags } from "../flags.js";
import {
  exitCodeFrom,
  summarize,
  severityOf,
} from "../diagnostics/exit-code.js";

type Diagnostic = import("@il/core").Diagnostic;

function isIlFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile() && /\.il$/i.test(p);
  } catch {
    return false;
  }
}

function printDiagnostics(diags: Diagnostic[]) {
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

function printWatchStatus(info: {
  errors: number;
  warnings: number;
  strict: boolean;
}) {
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

export type BuildFlags = GlobalFlags & {
  target: "ts" | "js";
  outDir: string;
  sourcemap?: boolean;
};

export async function runBuild(files: string[], flags: BuildFlags) {
  initRuntime({
    seedRng: flags.seedRng ? Number(flags.seedRng) : undefined,
    seedClock: flags.seedClock ? Number(flags.seedClock) : undefined,
  });

  const diagnostics: Diagnostic[] = [];
  const programs = files
    .filter(isIlFile)
    .map((f) => {
      const src = fs.readFileSync(f, "utf8");
      if (/^\s*$/.test(src)) return null as any; // skip empty ones
      const program = parse(src);
      diagnostics.push(...checkProgram(program));
      return { file: f, program };
    })
    .filter(Boolean);

  const { errors, warnings } = summarize(diagnostics);
  const code = exitCodeFrom(diagnostics, { strict: flags.strict });

  if (flags.json) {
    if (code === 1) {
      process.exitCode = 1;
      process.stdout.write(
        JSON.stringify({
          kind: "build",
          meta: {
            strict: !!flags.strict,
            target: flags.target,
            outDir: flags.outDir,
          },
          counts: { errors, warnings },
          diagnostics,
          status: "error",
          diags: diagnostics,
          built: [],
          exitCode: 1,
        }) + "\n",
      );
      return;
    }
  } else {
    printDiagnostics(diagnostics);
    if (code === 1 && errors === 0 && warnings > 0 && flags.strict) {
      console.error("Build failed due to warnings (strict).");
    }
    if (!flags.watch) process.exitCode = code;
    else printWatchStatus({ errors, warnings, strict: !!flags.strict });
    if (code === 1) return;
  }

  // Emit
  fs.mkdirSync(flags.outDir, { recursive: true });
  const built: string[] = [];

  for (const { file, program } of programs as Array<{
    file: string;
    program: any;
  }>) {
    const tsCode = emitTypeScript(program);
    if (flags.target === "ts") {
      const dest = path.join(
        flags.outDir,
        path.basename(file).replace(/\.il$/i, ".ts"),
      );
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
      const dest = path.join(
        flags.outDir,
        path.basename(file).replace(/\.il$/i, ".js"),
      );
      fs.writeFileSync(dest, js.outputText, "utf8");
      if (flags.sourcemap && js.sourceMapText)
        fs.writeFileSync(dest + ".map", js.sourceMapText, "utf8");
      built.push(dest);
    } else {
      console.error(`Unsupported target: ${flags.target}`);
      if (!flags.watch) process.exitCode = 2;
      return;
    }
  }

  if (flags.json) {
    process.exitCode = 0;
    process.stdout.write(
      JSON.stringify({
        kind: "build",
        meta: {
          strict: !!flags.strict,
          target: flags.target,
          outDir: flags.outDir,
        },
        counts: { errors, warnings },
        diagnostics,
        status: "ok",
        diags: diagnostics,
        built,
        exitCode: 0,
      }) + "\n",
    );
  } else if (!flags.watch) {
    for (const f of built) console.log(`Built: ${f}`);
    process.exitCode = 0;
  }
}
