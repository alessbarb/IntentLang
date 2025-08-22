import type { GlobalFlags } from "../../flags.js";

export type InitFlags = GlobalFlags & {
  yes?: boolean;
  template?: "minimal" | "tests";
};
