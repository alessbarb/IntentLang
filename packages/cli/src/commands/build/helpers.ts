import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import {
  parse,
  check as checkProgram,
  emitTypeScript,
  type Diagnostic,
} from "@il/core";
import type { ProgramInfo, BuildFlags } from "./types.js";

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

/** Escribe los archivos de salida (TS o JS) en el directorio de destino. */
export function emitFiles(
  programs: ProgramInfo[],
  flags: BuildFlags,
): string[] {
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
