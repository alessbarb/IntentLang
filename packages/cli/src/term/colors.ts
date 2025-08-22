/**
 * Basic color utilities for terminal output.
 * Colors are enabled by default but respect standard environment variables.
 */
let enabled =
  !process.env.NO_COLOR &&
  process.env.FORCE_COLOR !== "0" &&
  process.stdout.isTTY;

const identity = (s: string) => s;

/**
 * Create an object with coloring functions based on the enabled flag.
 */
const createColors = (isEnabled: boolean) => ({
  red: isEnabled ? (s: string) => `\x1b[31m${s}\x1b[0m` : identity,
  yellow: isEnabled ? (s: string) => `\x1b[33m${s}\x1b[0m` : identity,
  green: isEnabled ? (s: string) => `\x1b[32m${s}\x1b[0m` : identity,
  cyan: isEnabled ? (s: string) => `\x1b[36m${s}\x1b[0m` : identity,
  gray: isEnabled ? (s: string) => `\x1b[90m${s}\x1b[0m` : identity,
  bold: isEnabled ? (s: string) => `\x1b[1m${s}\x1b[0m` : identity,
});

/**
 * Mutable palette used by the CLI to colorize output.
 */
export let colors = createColors(enabled);

/**
 * Enable or disable colorized output at runtime.
 */
export function setColors(isEnabled: boolean): void {
  enabled = isEnabled;
  colors = createColors(enabled);
}
