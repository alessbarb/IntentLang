// Refactorization Notes:
// Replaced duplicated file processing with shared utility functions.

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { emitTypeScript } from "@intentlang/core";
import { isIlFile, processFiles } from "../../utils/files.js";
import type { ProgramInfo, BuildFlags } from "./types.js";

export { isIlFile, processFiles };

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
