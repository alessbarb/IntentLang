import vm from "node:vm";
import fs from "node:fs";
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

export type TestFlags = GlobalFlags & {
  only?: string;
  bail?: boolean;
  reporter?: "json" | "human";
};

export async function runTest(files: string[], flags: TestFlags) {
  initRuntime({
    seedRng: flags.seedRng ? Number(flags.seedRng) : undefined,
    seedClock: flags.seedClock ? Number(flags.seedClock) : undefined,
  });

  const diagnostics: Diagnostic[] = [];
  const programs = files.filter(isIlFile).map((f) => {
    const src = fs.readFileSync(f, "utf8");
    const program = parse(src);
    diagnostics.push(...checkProgram(program));
    return { file: f, program };
  });

  const counts = summarize(diagnostics);
  const preCode = exitCodeFrom(diagnostics, { strict: flags.strict });

  // No abortamos: ejecutamos tests igualmente
  if (!(flags.json || flags.reporter === "json")) {
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

  const onlyRe = flags.only ? new RegExp(flags.only) : null;
  const results: { name: string; ok: boolean; error?: string }[] = [];

  for (const { program } of programs) {
    const tsCode = emitTypeScript(program);
    const js = ts.transpileModule(tsCode, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText;

    const sandbox: any = { exports: {}, console, process };
    vm.runInNewContext(js, sandbox);
    const tests = Object.entries(sandbox.exports).filter(
      ([name, fn]) => name.startsWith("test_") && typeof fn === "function",
    );

    for (const [name, fn] of tests) {
      if (onlyRe && !onlyRe.test(name)) continue;
      try {
        await (fn as any)();
        if (!(flags.json || flags.reporter === "json"))
          console.log(`✓ ${name}`);
        results.push({ name, ok: true });
      } catch (err: any) {
        if (!(flags.json || flags.reporter === "json"))
          console.error(`✗ ${name}:`, err);
        results.push({ name, ok: false, error: String(err?.message ?? err) });
        if (flags.bail) break;
      }
    }
    if (flags.bail && results.some((r) => !r.ok)) break;
  }

  const failed = results.some((r) => !r.ok);
  const finalExit = failed ? 1 : preCode;

  if (flags.json || flags.reporter === "json") {
    process.exitCode = finalExit;
    console.log(
      JSON.stringify({
        kind: "test",
        meta: { strict: !!flags.strict },
        counts,
        diagnostics,
        status: finalExit === 0 ? "ok" : "error", // compat
        diags: diagnostics, // compat
        tests: results,
        exitCode: finalExit,
      }),
    );
  } else {
    if (!flags.watch) process.exitCode = finalExit;
    else
      printWatchStatus({
        errors: counts.errors,
        warnings: counts.warnings,
        strict: !!flags.strict,
      });
  }
}
