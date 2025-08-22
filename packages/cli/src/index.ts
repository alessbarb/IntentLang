#!/usr/bin/env node
// Refactorization Notes:
// This file has been completely rewritten to use the commander.js CLI framework.
// It provides a much more robust and scalable way to handle commands and flags.

import { Command } from "commander";
import { setColors } from "./term/colors.js";
import { loadConfig } from "./config/index.js";
import { expandInputsFromConfig } from "./config/expand.js";
import { expandInputs } from "./utils/files.js";
import { runCheck } from "./commands/check/index.js";
import { runBuild } from "./commands/build/index.js";
import { runTest } from "./commands/test/index.js";
import type { GlobalFlags } from "./flags.js";

const program = new Command();
const { config, configPath } = loadConfig(process.cwd());

program
  .name("ilc")
  .description("A CLI for the IntentLang compiler and test runner.")
  .argument(
    "[files...]",
    "Files or glob patterns to process. Uses ilconfig.json if not specified.",
  )
  .option("-s, --strict", "Treat warnings as failures (exit code 1)", false)
  .option("-j, --json", "Output results as JSON", false)
  .option("-w, --watch", "Watch files and re-run", false)
  .option("--no-color", "Disable colorized output", false)
  .option(
    "--max-errors <number>",
    "Limit printed errors (human)",
    (val) => parseInt(val, 10),
    undefined,
  )
  .option(
    "--seed-rng <seed>",
    "Seed the RNG for deterministic behavior",
    undefined,
  )
  .option(
    "--seed-clock <seed>",
    "Seed the clock for deterministic behavior",
    undefined,
  );

// Apply compilerOptions from ilconfig.json as defaults
const globalDefaults = {
  strict: config.compilerOptions?.strict,
  json: false, // CLI flag should always be explicit for this
  watch: false,
  noColor: false,
  maxErrors: undefined,
  seedRng: config.compilerOptions?.seedRng,
  seedClock: config.compilerOptions?.seedClock,
};

program
  .command("check", { isDefault: true })
  .description("Validate files for syntax and semantic errors.")
  .action(async (files, options) => {
    const finalFlags = { ...globalDefaults, ...options } as GlobalFlags;
    const filesToProcess = getFilesToProcess(files);
    setColors(!finalFlags.noColor);
    await runCheck(filesToProcess, finalFlags);
  });

program
  .command("build")
  .description("Compile .il files to TypeScript or JavaScript.")
  .option("-t, --target <target>", "Output target (ts, js)", "ts")
  .option("-o, --out <dir>", "Output directory", "dist")
  .option("--sourcemap", "Emit source maps when --target js", false)
  .action(async (files, options) => {
    const finalFlags = {
      ...globalDefaults,
      ...options,
      ...config.compilerOptions,
    } as any;
    const filesToProcess = getFilesToProcess(files);
    setColors(!finalFlags.noColor);
    await runBuild(filesToProcess, finalFlags);
  });

program
  .command("test")
  .description("Run tests defined in .il files.")
  .option("--only <pattern>", "Run tests matching a pattern", undefined)
  .option("--bail", "Stop on the first test failure", false)
  .option("--reporter <reporter>", "Reporter to use (human, json)", "human")
  .action(async (files, options) => {
    const finalFlags = {
      ...globalDefaults,
      ...options,
      ...config.compilerOptions,
    } as any;
    const filesToProcess = getFilesToProcess(files);
    setColors(!finalFlags.noColor);
    await runTest(filesToProcess, finalFlags);
  });

function getFilesToProcess(fileArgs: string[]): string[] {
  if (fileArgs.length > 0) {
    return expandInputs(fileArgs);
  }
  if (config.include) {
    return expandInputsFromConfig(config.include, config.exclude, configPath);
  }
  console.error(
    "Error: No input files specified and no 'include' pattern found in ilconfig.json.",
  );
  process.exit(2);
}

program.parse(process.argv);
