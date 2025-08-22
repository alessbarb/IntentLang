#!/usr/bin/env node
/**
 * Command line entry point for IntentLang.
 * Uses the commander.js framework to provide a robust command interface.
 */

import { Command } from "commander";
import { setColors } from "./term/colors.js";
import { loadConfig } from "./config/index.js";
import { expandInputsFromConfig } from "./config/expand.js";
import { expandInputs } from "./utils/files.js";
import { runCheck } from "./commands/check/index.js";
import { runBuild } from "./commands/build/index.js";
import { runTest } from "./commands/test/index.js";
import type { GlobalFlags } from "./flags.js";
import { failUsage } from "./utils/cli-error.js";

const program = new Command();
const { config, configPath } = loadConfig(process.cwd());

program
  .name("intent")
  .description("A CLI for the IntentLang compiler and test runner.")
  .option("-s, --strict", "Treat warnings as failures (exit code 1)")
  .option("-j, --json", "Output results as JSON")
  .option("-w, --watch", "Watch files and re-run")
  .option("--no-color", "Disable colorized output")
  .option(
    "--max-errors <number>",
    "Limit printed errors (human)",
    (val: string) => parseInt(val, 10),
  )
  .option("--seed-rng <seed>", "Seed the RNG for deterministic behavior")
  .option("--seed-clock <seed>", "Seed the clock for deterministic behavior");

/**
 * Convert an arbitrary value into a deterministic seed string.
 * Returns `undefined` if the value cannot be interpreted as a finite number.
 */
const coerceSeed = (v: unknown): string | undefined => {
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : undefined;
};

/**
 * Default flag values derived from the loaded configuration.
 */
const globalDefaults = {
  strict: config.compilerOptions?.strict,
  json: undefined,
  watch: undefined,
  noColor: undefined,
  maxErrors: undefined,
  seedRng: coerceSeed(config.compilerOptions?.seedRng),
  seedClock: coerceSeed(config.compilerOptions?.seedClock),
} as GlobalFlags;

program
  .command("check", { isDefault: true })
  .description("Validate files for syntax and semantic errors.")
  .argument("[files...]", "Files or glob patterns to process")
  .action(async (files: string[], _options: unknown, command: Command) => {
    const merged = command.optsWithGlobals?.() ?? {
      ...program.opts(),
      ...command.opts?.(),
    };
    const finalFlags = { ...globalDefaults, ...merged } as GlobalFlags;
    const filesToProcess = getFilesToProcess(files, finalFlags);
    setColors(!finalFlags.noColor);
    await runCheck(filesToProcess, finalFlags);
  });

program
  .command("build")
  .description("Compile .il files to TypeScript or JavaScript.")
  .argument("[files...]", "Files or glob patterns to process")
  .option("-t, --target <target>", "Output target (ts, js)")
  .option("-o, --out <dir>", "Output directory")
  .option("--sourcemap", "Emit source maps when --target js")
  .action(async (files: string[], _options: unknown, command: Command) => {
    const globals = command.optsWithGlobals?.() ?? {
      ...program.opts(),
      ...command.opts?.(),
    };
    const merged = { ...config.compilerOptions, ...globals };
    const finalFlags = {
      ...globalDefaults,
      ...merged,
      // Normalize legacy flag names.
      outDir: (merged as any).out ?? merged.outDir ?? "dist",
      target: merged.target ?? "ts",
    } as GlobalFlags & {
      target: "ts" | "js";
      outDir: string;
      sourcemap?: boolean;
    };
    // Validate output target.
    if (!["ts", "js"].includes(finalFlags.target as any)) {
      try {
        failUsage(
          finalFlags,
          "ILC0401",
          "Error: --target must be 'ts' or 'js'.",
        );
      } catch {}
      return;
    }
    const filesToProcess = getFilesToProcess(files, finalFlags);
    setColors(!finalFlags.noColor);
    await runBuild(filesToProcess, finalFlags);
  });

program
  .command("test")
  .description("Run tests defined in .il files.")
  .argument("[files...]", "Files or glob patterns to process")
  .option("--only <pattern>", "Run tests matching a pattern")
  .option("--bail", "Stop on the first test failure")
  .option("--reporter <reporter>", "Reporter to use (human, json)")
  .action(async (files: string[], _options: unknown, command: Command) => {
    const globals = command.optsWithGlobals?.() ?? {
      ...program.opts(),
      ...command.opts?.(),
    };
    const merged = { reporter: "human", ...config.compilerOptions, ...globals };
    const finalFlags = { ...globalDefaults, ...merged } as any;
    const filesToProcess = getFilesToProcess(files, finalFlags);
    setColors(!finalFlags.noColor);
    await runTest(filesToProcess, finalFlags);
  });

/**
 * Resolve input files from command-line arguments or configuration.
 * Exits with code 2 if no files can be resolved.
 */
function getFilesToProcess(fileArgs: string[], global: GlobalFlags): string[] {
  if (fileArgs && fileArgs.length > 0) return expandInputs(fileArgs);
  if (config.include)
    return expandInputsFromConfig(config.include, config.exclude, configPath);
  if (global.json) {
    process.stdout.write(
      JSON.stringify({
        kind: "check",
        meta: { strict: !!global.strict, watch: !!global.watch },
        counts: { errors: 0, warnings: 0 },
        diagnostics: [],
        status: "error",
        message: "No input files and no 'include' in ilconfig.json.",
        exitCode: 2,
      }) + "\n",
    );
  } else {
    console.error(
      "Error: No input files specified and no 'include' pattern found in ilconfig.json.",
    );
  }
  process.exit(2);
}

program.parse(process.argv);
