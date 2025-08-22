// utils/cli-error.ts
import { handleJsonOutput } from "./output.js";
import type { GlobalFlags } from "../flags.js";

/** ILC0401 unknown flag/invalid combo, ILC0402 no files/empty pattern, ILC0403 invalid config */
export type CliErrorCode = "ILC0401" | "ILC0402" | "ILC0403";

export function failUsage(
  flags: GlobalFlags,
  code: CliErrorCode,
  message: string,
): never {
  if (flags.json) {
    handleJsonOutput({
      kind: "check", // el 'kind' es indiferente para errores de uso, usamos 'check' por defecto
      flags,
      diagnostics: [{ code, message, span: undefined } as any],
      errors: 1,
      warnings: 0,
      code: 2,
      message,
    });
  } else {
    console.error(message);
    process.exitCode = 2;
  }
  // Terminar el flujo actual
  // (no usamos process.exit para permitir tests; los callers deben devolver)
  throw Object.assign(new Error(message), { exitCode: 2, cliCode: code });
}
