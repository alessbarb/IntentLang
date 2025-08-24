import { expandInputs } from "../../utils/files.js";
import { handleJsonOutput } from "../../utils/output.js";
import { printPerFile, printFmtSummary } from "./output.js";
import { formatFile, formatFromStdin } from "./helpers.js";
import type { FmtFlags, FmtResult } from "./types.js";

export async function runFmt(files: string[], flags: FmtFlags) {
  // stdin mode
  if (flags.stdin || (files.length === 1 && files[0] === "-")) {
    const out = await formatFromStdin(flags);
    if (flags.write || flags.check) {
      // en modo stdin, ignoramos write/check y volcamos a stdout
    }
    process.stdout.write(out);
    process.exitCode = 0;
    return;
  }

  const expanded = expandInputs(files);
  const results: FmtResult[] = expanded.map((f) => formatFile(f, flags));

  if (flags.json) {
    const changed = results.filter((r) => r.changed).length;
    handleJsonOutput({
      kind: "fmt" as any,
      flags: flags as any,
      diagnostics: [],
      errors: 0,
      warnings: 0,
      code: flags.check && changed > 0 ? 1 : 0,
      message: undefined,
      created: undefined,
    } as any);
    return;
  }

  printPerFile(results);
  printFmtSummary(results);

  if (flags.check) {
    const hasChanges = results.some((r) => r.changed);
    process.exitCode = hasChanges ? 1 : 0;
  } else {
    process.exitCode = 0;
  }
}
