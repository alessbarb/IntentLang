/**
 * Flags that are shared across all CLI subcommands.
 */
export type GlobalFlags = {
  json?: boolean;
  watch?: boolean;
  strict?: boolean;
  seedRng?: string;
  seedClock?: string;
  maxErrors?: number;
  noColor?: boolean;
};

/**
 * Parse global flags from the given argument vector, returning unconsumed args.
 */
export function parseGlobalFlags(argv: string[]): {
  rest: string[];
  flags: GlobalFlags;
} {
  const flags: GlobalFlags = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--json":
        flags.json = true;
        break;
      case "--watch":
        flags.watch = true;
        break;
      case "--strict":
        flags.strict = true;
        break;
      case "--no-color":
        flags.noColor = true;
        break;
      case "--max-errors": {
        const n = Number(argv[++i]);
        if (Number.isInteger(n) && n >= 0) flags.maxErrors = n;
        else rest.push(a);
        break;
      }
      case "--seed-rng":
        flags.seedRng = argv[++i];
        break;
      case "--seed-clock":
        flags.seedClock = argv[++i];
        break;
      default:
        rest.push(a);
    }
  }
  return { rest, flags };
}

/**
 * Help text describing available global flags.
 */
export const GLOBAL_FLAGS_HELP = `
  --strict         Treat warnings as failures (exit code 1)
  --json           JSON output
  --watch          Watch files and re-run
  --no-color       Disable colorized output
  --max-errors N   Limit printed errors (human)
  --seed-rng N     Seed the RNG
  --seed-clock N   Seed the clock
`.trim();
