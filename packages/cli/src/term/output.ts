import path from "node:path";
import fs from "node:fs";
import type { Diagnostic } from "@intentlang/core";
import { severityOf } from "../diagnostics/exit-code.js";
import { colors } from "./colors.js";

/**
 * Print diagnostics to `stderr` with colors and code frames.
 * @param diags - Diagnostics to print.
 * @param sources - Map from filename to file contents.
 * @param maxErrors - Maximum number of errors to display.
 */
export function printDiagnostics(
  diags: Diagnostic[],
  sources: Map<string, string>,
  maxErrors?: number,
): void {
  if (diags.length === 0) return;

  let errorsPrinted = 0;
  const totalErrors = diags.filter(
    (d) => severityOf(d as any) === "error",
  ).length;

  for (const d of diags) {
    const sev = severityOf(d as any);
    if (sev === "error") {
      if (maxErrors !== undefined && errorsPrinted >= maxErrors) continue;
      errorsPrinted++;
    }

    const code = d.code ?? "UNKNOWN";
    const tag =
      sev === "error"
        ? colors.red(colors.bold("ERROR"))
        : colors.yellow(colors.bold("WARNING"));

    // Diagnostic header.
    console.error(`\n-- ${tag} (${colors.bold(code)}) ${"-".repeat(50)}`);
    // Diagnostic message.
    console.error(`\n${colors.bold(d.message)}\n`);

    const file = (d as any).file;
    if (d.span && file) {
      const location = colors.cyan(
        `${path.basename(file)}:${d.span.start.line}:${d.span.start.column}`,
      );
      console.error(`  ${colors.gray("-->")} ${location}`);

      // Code frame.
      const source = sources.get(file);
      if (source) {
        const lines = source.split("\n");
        const line = lines[d.span.start.line - 1];
        if (line) {
          const lineNumStr = String(d.span.start.line);
          const gutter = `${colors.gray(`${lineNumStr} |`)}`;
          console.error(`\n${gutter} ${line}`);
          const width = Math.max(1, d.span.end.column - d.span.start.column);
          const caret = colors.red("^".repeat(width));
          console.error(
            `${colors.gray(" ".repeat(lineNumStr.length + 2))}${" ".repeat(d.span.start.column - 1)}${caret}`,
          );
        }
      }
    }
  }

  if (maxErrors !== undefined && totalErrors > errorsPrinted) {
    console.error(
      `\n${colors.yellow(`+${totalErrors - errorsPrinted} more error(s) not shown.`)}`,
    );
  }
  // Blank line for separation.
  console.error();
}

/**
 * Print status information in watch mode.
 */
export function printWatchStatus(info: {
  errors: number;
  warnings: number;
  strict: boolean;
}): void {
  const { errors, warnings, strict } = info;
  let statusMessage: string;

  if (errors > 0) {
    statusMessage = colors.red(`${errors} error(s)`);
  } else if (strict && warnings > 0) {
    statusMessage = colors.yellow(`${warnings} warning(s) (strict)`);
  } else if (warnings > 0) {
    statusMessage = colors.yellow(`${warnings} warning(s)`);
  } else {
    statusMessage = colors.green("clean");
  }

  const time = new Date().toLocaleTimeString();
  console.error(
    colors.gray(`[${time}]`),
    `Watching for changes... Status: ${statusMessage}`,
  );
}
