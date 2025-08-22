import { colors } from "../../term/colors.js";

/**
 * Print a human summary after the build process.
 */
export function printBuildSummary(
  errorCount: number,
  warningCount: number,
  isStrict: boolean,
  builtFileCount: number,
) {
  if (errorCount > 0) {
    console.error(
      colors.red(colors.bold(`Build failed with ${errorCount} error(s).`)),
    );
  } else if (isStrict && warningCount > 0) {
    console.error(
      colors.yellow(
        colors.bold(
          `Build failed due to ${warningCount} warning(s) in strict mode.`,
        ),
      ),
    );
  } else {
    console.log(
      colors.green(`Build succeeded. ${builtFileCount} file(s) emitted.`),
    );
    if (warningCount > 0) {
      console.log(colors.yellow(`(${warningCount} warning(s) found)`));
    }
  }
}
