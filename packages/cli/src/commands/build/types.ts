import type { GlobalFlags } from "../../flags.js";

export type BuildFlags = GlobalFlags & {
  target: "ts" | "js" | "py";
  outDir: string;
  sourcemap?: boolean;
};

export type ProgramInfo = {
  file: string;
  program: any;
};
