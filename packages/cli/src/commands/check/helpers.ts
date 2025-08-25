import fs from "node:fs";
import path from "node:path";
import { check as checkProgram, parseToAst } from "@intentlang/core";
import type { Diagnostic, CacheEntry } from "./types.js";
import { expandInputs } from "../../utils/files.js";

/**
 * Read the entire standard input as a UTF-8 string.
 */
export async function readStdin(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

/**
 * Run a checking pass on a set of file patterns, using a cache to avoid
 * redundant work.
 */
export function checkFiles(
  filePatterns: string[],
  cache: Map<string, CacheEntry>,
): {
  diagnostics: Diagnostic[];
  files: string[];
  sources: Map<string, string>;
} {
  const files = expandInputs(filePatterns);
  const diagnostics: Diagnostic[] = [];
  const sources = new Map<string, string>();

  for (const k of Array.from(cache.keys())) {
    if (!files.includes(k)) cache.delete(k);
  }

  for (const f of files) {
    try {
      const st = fs.statSync(f);
      const prev = cache.get(f);
      let diags: Diagnostic[];

      if (!prev || prev.mtimeMs !== st.mtimeMs) {
        const src = fs.readFileSync(f, "utf8");
        sources.set(f, src);
        diags = /^\s*$/.test(src) ? [] : checkProgram(parseToAst(src));
        cache.set(f, { mtimeMs: st.mtimeMs, diags });
      } else {
        diags = prev.diags;
        if (!sources.has(f)) {
          sources.set(f, fs.readFileSync(f, "utf8"));
        }
      }

      const normFile = f.split(path.sep).join("/");
      for (const d of diags) (d as any).file = normFile;
      diagnostics.push(...diags);
    } catch {
      cache.delete(f);
    }
  }
  return { diagnostics, files, sources };
}
