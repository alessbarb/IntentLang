import { colors } from "../../term/colors.js";
import type { FmtResult } from "./types.js";

export function printFmtSummary(results: FmtResult[]) {
  const changed = results.filter((r) => r.changed).length;
  const total = results.length;
  if (total === 0) {
    console.log(colors.yellow("No files to format."));
    return;
  }
  const msg =
    changed === 0
      ? colors.green(`All ${total} file(s) are well-formatted.`)
      : colors.yellow(`${changed}/${total} file(s) would be reformatted.`);
  console.log(msg);
}

export function printPerFile(results: FmtResult[]) {
  for (const r of results) {
    const mark = r.changed ? colors.yellow("~") : colors.green("✓");
    console.log(`${mark} ${r.path}`);
  }
}
