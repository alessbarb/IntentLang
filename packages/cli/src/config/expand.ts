import path from "node:path";
import { expandInputs } from "../utils/files.js";

/**
 * Resolve include and exclude glob patterns defined in a config file.
 *
 * Paths are resolved relative to the configuration file when available,
 * otherwise the current working directory is used.
 */
export function expandInputsFromConfig(
  include: string[],
  exclude: string[] | undefined,
  configPath: string | undefined,
): string[] {
  const baseDir = configPath ? path.dirname(configPath) : process.cwd();

  const includedFiles = new Set(expandInputs(include, baseDir));

  if (!exclude || exclude.length === 0) {
    return Array.from(includedFiles).sort();
  }

  const excludedFiles = new Set(expandInputs(exclude, baseDir));
  return Array.from(includedFiles)
    .filter((f) => !excludedFiles.has(f))
    .sort();
}
