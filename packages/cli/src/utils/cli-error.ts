import { handleJsonOutput } from "./output.js";
import type { GlobalFlags } from "../flags.js";

/**
 * CLI diagnostic codes used for usage errors.
 */
export type CliErrorCode = "ILC0401" | "ILC0402" | "ILC0403";

/**
 * Report a usage error and terminate the current flow.
 * Throws an error to allow callers to handle cleanup in tests.
 */
export function failUsage(
  flags: GlobalFlags,
  code: CliErrorCode,
  message: string,
): never {
  if (flags.json) {
    handleJsonOutput({
      // The specific kind is irrelevant for usage errors.
      kind: "check",
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
  throw Object.assign(new Error(message), { exitCode: 2, cliCode: code });
}
