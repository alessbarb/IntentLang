import fs from "node:fs";
import fg from "fast-glob";
import {
  parseToAst,
  check as checkProgram,
  type Diagnostic,
} from "@intentlang/core";
import type { ProgramInfo } from "./types.js";

/**
 * Determine whether a path points to an `.il` file.
 */
export function isIlFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile() && /\.il$/i.test(p);
  } catch {
    return false;
  }
}

/**
 * Parse and check a list of files, returning diagnostics and program info.
 */
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
      const program = parseToAst(src);
      const diags = checkProgram(program);
      diags.forEach((d: any) => ((d as any).file = file));
      diagnostics.push(...diags);
      return { file, program };
    })
    .filter((p): p is ProgramInfo => p !== null);

  return { programs, diagnostics, sources };
}

/**
 * Expand a set of input patterns (files, directories or globs) to concrete
 * file paths.
 */
export function expandInputs(
  inputs: string[],
  cwd: string = process.cwd(),
): string[] {
  const matches = fg.sync(
    inputs.filter(Boolean).map((i) => {
      if (fs.existsSync(i) && fs.statSync(i).isDirectory()) {
        return `${i.replace(/\\/g, "/")}/**/*.il`;
      }
      return i.replace(/\\/g, "/");
    }),
    { cwd, dot: true },
  ) as string[];
  return Array.from(new Set(matches)).sort();
}
