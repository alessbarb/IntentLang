/**
 * User configuration structure loaded from `ilconfig.json`.
 */
export interface ILConfig {
  /**
   * Options forwarded to the compiler.
   */
  compilerOptions?: {
    /** Enforce strict mode when checking. */
    strict?: boolean;
    /** Output target for builds. */
    target?: "ts" | "js";
    /** Directory where build artifacts are written. */
    outDir?: string;
    /** Emit sourcemaps when transpiling to JavaScript. */
    sourcemap?: boolean;
    /** Seed for deterministic random number generation. */
    seedRng?: string;
    /** Seed for deterministic clock. */
    seedClock?: string;
  };
  /** Glob patterns to include. */
  include?: string[];
  /** Glob patterns to exclude. */
  exclude?: string[];
}
