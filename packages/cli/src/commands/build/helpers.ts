// Refactorization Notes:
// Replaced duplicated file processing with shared utility functions.

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { emitTypeScript } from "@intentlang/core";
import { isIlFile, processFiles } from "../../utils/files.js";
import type { BuildFlags } from "./types.js";
import type { ProgramInfo } from "../../utils/types.js";

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
      const transpiled = ts.transpileModule(tsCode, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          sourceMap: !!flags.sourcemap,
        },
      });
      const dest = destPath(".js");
      let jsOut = transpiled.outputText;
      if (flags.sourcemap && transpiled.sourceMapText) {
        const mapFile = `${baseName}.js.map`;
        const mapPath = destPath(".js.map");
        fs.writeFileSync(mapPath, transpiled.sourceMapText, "utf8");
        // Asegura comentario de referencia relativo
        if (!jsOut.includes("//# sourceMappingURL=")) {
          jsOut += `\n//# sourceMappingURL=${mapFile}\n`;
        }
      }
      fs.writeFileSync(dest, jsOut, "utf8");
      built.push(dest);
    }
  }
  return built;
}
