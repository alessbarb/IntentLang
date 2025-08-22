// Refactorization Notes:
// Replaced custom expandInputs with shared utility function.

import fs from "node:fs";
import path from "node:path";
import { parse, check as checkProgram } from "@intentlang/core";
import { expandInputs } from "../../utils/files.js";
import type { Diagnostic, CacheEntry } from "./types.js";

export { expandInputs };

/** Lee el contenido completo de la entrada estándar. */
export async function readStdin(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

/** Ejecuta una pasada de validación, utilizando un caché para evitar trabajo redundante. */
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
  const sources = new Map<string, string>(); // Purga entradas del caché para ficheros eliminados

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
        diags = /^\s*$/.test(src) ? [] : checkProgram(parse(src));
        cache.set(f, { mtimeMs: st.mtimeMs, diags });
      } else {
        diags = prev.diags; // Si está en caché, aún necesitamos el fuente para el reportero
        if (!sources.has(f)) {
          sources.set(f, fs.readFileSync(f, "utf8"));
        }
      }

      const normFile = f.split(path.sep).join("/");
      for (const d of diags) (d as any).file = normFile;
      diagnostics.push(...diags);
    } catch {
      cache.delete(f); // Elimina del caché si hay un error al leer
    }
  }
  return { diagnostics, files, sources };
}
