import fs from "node:fs";
import path from "node:path";
import { parse, check as checkProgram } from "@intentlang/core";
import type { Diagnostic, CacheEntry } from "./types.js";

const GLOB_RE = /[*?\[]/;

/** Comprueba si una cadena parece un patrón glob. */
const looksLikeGlob = (s: string) => GLOB_RE.test(s);

/** Convierte un patrón glob a una expresión regular. */
function globToRegExp(glob: string): RegExp {
  let re = glob.replace(/[.+^${}()|\\]/g, "\\$&");
  re = re.replace(/\*\*/g, "§§DS§§");
  re = re.replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]");
  re = re.replace(/§§DS§§/g, ".*");
  return new RegExp(`^${re}$`);
}

/** Lista recursivamente todos los ficheros `.il` en un directorio. */
function listIlRecursive(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listIlRecursive(p, out);
    else if (e.isFile() && /\.il$/i.test(e.name)) out.push(p);
  }
}

/** Expande los patrones de entrada (ficheros, directorios, globs) a una lista de ficheros. */
export function expandInputs(inputs: string[]): string[] {
  const out = new Set<string>();
  for (let raw of inputs) {
    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      raw = raw.slice(1, -1);
    }

    if (!looksLikeGlob(raw)) {
      if (fs.existsSync(raw) && fs.statSync(raw).isDirectory()) {
        const pool: string[] = [];
        listIlRecursive(raw, pool);
        for (const f of pool) out.add(f);
      } else if (
        fs.existsSync(raw) &&
        fs.statSync(raw).isFile() &&
        /\.il$/i.test(raw)
      ) {
        out.add(raw);
      }
      continue;
    }

    const norm = raw.split(/[\\/]/).join("/");
    const firstStar = norm.search(GLOB_RE);
    const baseNorm =
      firstStar > 0 ? norm.slice(0, norm.lastIndexOf("/", firstStar) + 1) : ".";
    const rx = globToRegExp(norm);
    const pool: string[] = [];
    const baseFs = baseNorm.split("/").join(path.sep) || ".";
    listIlRecursive(baseFs, pool);

    for (const f of pool) {
      const normFile = f.split(path.sep).join("/");
      if (rx.test(normFile)) out.add(f);
    }
  }
  return Array.from(out).sort();
}

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
  const sources = new Map<string, string>();

  // Purga entradas del caché para ficheros eliminados
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
        diags = prev.diags;
        // Si está en caché, aún necesitamos el fuente para el reportero
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
