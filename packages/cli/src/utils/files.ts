// Refactorization Notes:
// Unifies file processing and globbing logic, replacing custom implementations.

import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import {
  parse,
  check as checkProgram,
  type Diagnostic,
} from "@intentlang/core";
import type { ProgramInfo } from "./types.js";

/** Comprueba si una ruta corresponde a un archivo `.il`. */
export function isIlFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile() && /\.il$/i.test(p);
  } catch {
    return false;
  }
}

/** Procesa los archivos de entrada, parseando y comprobando cada uno. */
export function processFiles(files: string[]): {
  programs: ProgramInfo[];
  diagnostics: Diagnostic[];
  sources: Map<string, string>;
} {
  const diagnostics: Diagnostic[] = [];
  const sources = new Map<string, string>();
  const programs = files
    .filter(isIlFile)
    .map((file) => {
      const src = fs.readFileSync(file, "utf8");
      sources.set(file, src);
      if (/^\s*$/.test(src)) return null;
      const program = parse(src);
      const diags = checkProgram(program);
      diags.forEach((d: any) => ((d as any).file = file));
      diagnostics.push(...diags);
      return { file, program };
    })
    .filter((p): p is ProgramInfo => p !== null);

  return { programs, diagnostics, sources };
}

/** Expande los patrones de entrada (ficheros, directorios, globs) a una lista de ficheros. */
export function expandInputs(
  inputs: string[],
  cwd: string = process.cwd(),
): string[] {
  const matches = fg.sync(
    inputs.filter(Boolean).map((i) => {
      // Si es un directorio, añadimos un glob para buscar archivos .il
      if (fs.existsSync(i) && fs.statSync(i).isDirectory()) {
        return `${i.replace(/\\/g, "/")}/**/*.il`;
      }
      return i.replace(/\\/g, "/");
    }),
    { cwd, dot: true },
  );
  return Array.from(new Set(matches)).sort();
}
