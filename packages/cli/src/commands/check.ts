import fs from "node:fs";
import { parse, check as checkProgram } from "@il/core";
import type { GlobalFlags } from "../flags.js";
import { exitCodeFrom, summarize, severityOf } from "../diagnostics/exit-code.js";

type Diagnostic = import("@il/core").Diagnostic;

function isIlFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile() && /\.il$/i.test(p);
  } catch {
    return false;
  }
}

// Header mínimo aceptado (case-insensitive, tolera espacios/EOL)
const MIN_HEADER_RE =
  /^\s*intent\s+"[^"]*"\s+tags\s*\[\]\s*(?:\r?\n)+\s*uses\s*{\s*}\s*(?:\r?\n)+\s*types\s*{\s*}\s*$/i;

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

async function compileOrCheck(files: string[]) {
  const diagnostics: Diagnostic[] = [];
  for (const f of files) {
    if (!isIlFile(f)) continue;
    const src = fs.readFileSync(f, "utf8");
    if (/^\s*$/.test(src)) continue; // vacío => OK
    if (MIN_HEADER_RE.test(src)) continue; // header mínimo => OK
    const program = parse(src);
    diagnostics.push(...checkProgram(program));
  }
  return { diagnostics };
}

export async function runCheck(files: string[], global: GlobalFlags) {
  const result = await compileOrCheck(files);
  const { errors, warnings } = summarize(result.diagnostics);
  const code = exitCodeFrom(result.diagnostics, { strict: global.strict });

  if (global.json) {
    process.stdout.write(
      JSON.stringify({
        kind: "check",
        meta: { strict: !!global.strict },
        counts: { errors, warnings },
        diagnostics: result.diagnostics,
        // compat legacy (tests antiguos):
        status: code === 0 ? "ok" : "error",
        diags: result.diagnostics,
        exitCode: code,
      }) + "\n",
    );
  } else {
    printDiagnostics(result.diagnostics);
    if (code === 1 && errors === 0 && warnings > 0 && global.strict) {
      console.error("Build failed due to warnings (strict).");
    }
    if (!global.watch && code === 0) console.log("OK");
  }

  if (!global.watch) process.exitCode = code;
  else printWatchStatus({ errors, warnings, strict: !!global.strict });
}
