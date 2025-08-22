import type { GlobalFlags } from "../../flags.js";

/**
 * Flags specific to the `build` command.
 */
export type BuildFlags = GlobalFlags & {
  /** Output format for emitted files. */
  target: "ts" | "js";
  /** Directory where files are written. */
  outDir: string;
  /** Emit sourcemaps when targeting JavaScript. */
  sourcemap?: boolean;
};
