import type { GlobalFlags } from "../../flags.js";
import type { ProgramInfo } from "../../utils/types.js";

export type BuildFlags = GlobalFlags & {
  target: "ts" | "js";
  outDir: string;
  sourcemap?: boolean;
};

export type { ProgramInfo };
