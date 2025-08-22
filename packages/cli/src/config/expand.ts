// Refactorization Notes:
// Now uses the shared expandInputs function.

import path from "node:path";
import { expandInputs } from "../utils/files.js";

export function expandInputsFromConfig(
  include: string[],
  exclude: string[] | undefined,
  configPath: string | undefined,
): string[] {
  const baseDir = configPath ? path.dirname(configPath) : process.cwd(); // Resuelve los patrones de inclusión relativos al archivo de configuración.

  const includedFiles = new Set(expandInputs(include, baseDir));

  if (!exclude || exclude.length === 0) {
    return Array.from(includedFiles).sort();
  } // Resuelve los patrones de exclusión y filtra los resultados.

  const excludedFiles = new Set(expandInputs(exclude, baseDir));
  return Array.from(includedFiles)
    .filter((f) => !excludedFiles.has(f))
    .sort();
}
