import fs from "node:fs";
import path from "node:path";
import { parse, check as checkProgram } from "@il/core";
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

// Minimal accepted header (case-insensitive, tolerates spaces/EOL)
const MIN_HEADER_RE =
  /^\s*intent\s+"[^"]*"\s+tags\s*\[\]\s*(?:\r?\n)+\s*uses\s*{\s*}\s*(?:\r?\n)+\s*types\s*{\s*}\s*$/i;

// ---------- minimal globbing ----------
const SEP = path.sep;
const GLOB_RE = /[*?\[]/;
const looksLikeGlob = (s: string) => GLOB_RE.test(s);

function globToRegExp(glob: string): RegExp {
    // Support: **, *, ?, simple escaping; normalize to '/'
  let re = glob.replace(/[.+^${}()|\\]/g, "\\$&");
  re = re.replace(/\*\*/g, "§§DS§§");
  re = re.replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]");
  re = re.replace(/§§DS§§/g, ".*");
  return new RegExp("^" + re + "$");
}

function listIlRecursive(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listIlRecursive(p, out);
    else if (e.isFile() && /\.il$/i.test(e.name)) out.push(p);
  }
}

function expandInputs(inputs: string[]): string[] {
  const out = new Set<string>();
  for (const inp of inputs) {
    if (!looksLikeGlob(inp)) {
      if (fs.existsSync(inp) && fs.statSync(inp).isDirectory()) {
        listIlRecursive(inp, [...out]);
      } else if (
        fs.existsSync(inp) &&
        fs.statSync(inp).isFile() &&
        /\.il$/i.test(inp)
      ) {
        out.add(inp);
      }
      continue;
    }
    const firstStar = inp.search(GLOB_RE);
    const base =
      firstStar > 0 ? inp.slice(0, inp.lastIndexOf(SEP, firstStar) + 1) : ".";
    const rx = globToRegExp(path.normalize(inp).split(path.sep).join("/"));
    const pool: string[] = [];
    listIlRecursive(base || ".", pool);
    for (const f of pool) {
      const norm = f.split(path.sep).join("/");
      if (rx.test(norm)) out.add(f);
    }
  }
  return Array.from(out).sort();
}

function printDiagnostics(diags: Diagnostic[], maxErrors?: number) {
  let errorsPrinted = 0;
  let totalErrors = 0;
  for (const d of diags) {
    const sev = severityOf(d as any);
    if (sev === "error") {
      totalErrors++;
      if (maxErrors !== undefined && errorsPrinted >= maxErrors) continue;
      errorsPrinted++;
    }
    const where = (d as any).span
      ? ` at ${(d as any).span.start.line}:${(d as any).span.start.column}`
      : "";
    const tag =
      sev === "error" ? "[ERROR]" : sev === "warning" ? "[WARN ]" : "[INFO ]";
    console.error(`${tag} ${(d as any).message}${where}`);
  }
  if (maxErrors !== undefined && totalErrors > errorsPrinted) {
    console.error(`+${totalErrors - errorsPrinted} errors not shown`);
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

// ---------- per-file cache ----------
type CacheEntry = { mtimeMs: number; diags: Diagnostic[] };

async function runOnce(filePatterns: string[], cache: Map<string, CacheEntry>) {
  const files = expandInputs(filePatterns);
  const diagnostics: Diagnostic[] = [];
  // purga entradas borradas
  for (const k of Array.from(cache.keys()))
    if (!files.includes(k)) cache.delete(k);
  for (const f of files) {
    try {
      const st = fs.statSync(f);
      const prev = cache.get(f);
      let diags: Diagnostic[];
      if (!prev || prev.mtimeMs !== st.mtimeMs) {
        const src = fs.readFileSync(f, "utf8");
        if (/^\s*$/.test(src)) diags = [];
        else {
          const program = parse(src);
          diags = checkProgram(program);
        }
        cache.set(f, { mtimeMs: st.mtimeMs, diags });
      } else {
        diags = prev.diags;
      }
      diagnostics.push(...diags);
    } catch {
      cache.delete(f);
    }
  }
  return { diagnostics };
}

export async function runCheck(files: string[], global: GlobalFlags) {
  const cache = new Map<string, CacheEntry>();

  const doPass = async () => {
    const { diagnostics } = await runOnce(files, cache);
    const { errors, warnings } = summarize(diagnostics);
    const code = exitCodeFrom(diagnostics, { strict: global.strict });

    if (global.json) {
      process.stdout.write(
        JSON.stringify({
          kind: "check",
          meta: { strict: !!global.strict, watch: !!global.watch },
          counts: { errors, warnings },
          diagnostics,
          // compat legacy:
          status: code === 0 ? "ok" : "error",
          diags: diagnostics,
          exitCode: code,
        }) + "\n",
      );
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

  // Pass inicial
  await doPass();
  if (!global.watch) return;

  // Watch mode con debounce 200 ms
  let timer: NodeJS.Timeout | null = null;
  const debounceMs = 200;
  const roots = new Set<string>();
  for (const p of files) {
    if (looksLikeGlob(p)) {
      const firstStar = p.search(GLOB_RE);
      const base =
        firstStar > 0 ? p.slice(0, p.lastIndexOf(SEP, firstStar) + 1) : ".";
      roots.add(path.resolve(base || "."));
    } else {
      const st = fs.existsSync(p) ? fs.statSync(p) : null;
      if (st?.isDirectory()) roots.add(path.resolve(p));
      else roots.add(path.dirname(path.resolve(p)));
    }
  }
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void doPass();
    }, debounceMs);
  };
  for (const r of roots) {
    try {
      fs.watch(r, { recursive: true }, schedule);
    } catch {
      fs.watch(r, {}, schedule);
    } // Linux: sin recursive
  }
  const poll = setInterval(schedule, 2000); // “keep-alive” polling
  process.on("SIGINT", () => {
    clearInterval(poll);
    if (timer) clearTimeout(timer);
    process.exit(0); // Requisito: Ctrl+C => 0
  });
}
