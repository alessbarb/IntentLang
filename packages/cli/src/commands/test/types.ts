import type { GlobalFlags } from "../../flags.js";
import type { CliDiagnostic } from "../../utils/types.js";
/**
 * Diagnostic produced during test execution.
 */
export type Diagnostic = CliDiagnostic;

/**
 * Flags specific to the `test` command.
 */
export type TestFlags = GlobalFlags & {
  /** Only run tests whose name matches this pattern. */
  only?: string;
  /** Stop after the first failing test. */
  bail?: boolean;
  /** Output format for results. */
  reporter?: "json" | "human";
};

/**
 * Result of an individual test case.
 */
export type TestResult = {
  /** Test identifier derived from the exported function name. */
  name: string;
  /** Whether the test passed. */
  ok: boolean;
  /** Optional error message when the test fails. */
  error?: string;
};
