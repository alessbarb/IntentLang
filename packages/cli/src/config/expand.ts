import path from "node:path";
import { expandInputs } from "../commands/check/helpers.js";

export function expandInputsFromConfig(
  include: string[],
  exclude: string[] | undefined,
  configPath: string | undefined,
): string[] {
  const baseDir = configPath ? path.dirname(configPath) : process.cwd();

  // Resuelve los patrones de inclusión relativos al archivo de configuración.
  const includedFiles = expandInputs(
    include.map((p) => path.resolve(baseDir, p)),
  );

  if (!exclude || exclude.length === 0) {
    return includedFiles;
  }

  // Resuelve los patrones de exclusión y filtra los resultados.
  const excludedFiles = new Set(
    expandInputs(exclude.map((p) => path.resolve(baseDir, p))),
  );
  return includedFiles.filter((f) => !excludedFiles.has(f));
}
