import { colors } from "../../term/colors.js";

/**
 * Print a human summary after the check process.
 */
export function printCheckSummary(
  errorCount: number,
  warningCount: number,
  isStrict: boolean,
) {
  if (errorCount > 0) {
    console.error(
      colors.red(colors.bold(`Check failed with ${errorCount} error(s).`)),
    );
  } else if (isStrict && warningCount > 0) {
    console.error(
      colors.yellow(
        colors.bold(
          `Check failed due to ${warningCount} warning(s) in strict mode.`,
        ),
      ),
    );
  } else {
    console.log(colors.green("Check passed."));
    if (warningCount > 0) {
      console.log(colors.yellow(`(${warningCount} warning(s) found)`));
    }
  }
}
