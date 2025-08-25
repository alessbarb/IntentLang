import type { GlobalFlags } from "../../flags.js";

export type FmtFlags = GlobalFlags & {
  check?: boolean;
  write?: boolean;
  stdin?: boolean;
  width?: number;
  organizeImports?: boolean;
  organizeExports?: boolean;
};

export type FmtResult = {
  path: string;
  changed: boolean;
  diff?: string;
};
