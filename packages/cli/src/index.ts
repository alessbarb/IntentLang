#!/usr/bin/env node
/**
 * Command line entry point for IntentLang.
 * Uses the commander.js framework to provide a robust command interface.
 */

import { Command, Option as CommanderOption } from "commander";
import { setColors } from "./term/colors.js";
import { loadConfig } from "./config/index.js";
import { expandInputsFromConfig } from "./config/expand.js";
import { expandInputs } from "./utils/files.js";
import { runBuild } from "./commands/build/index.js";
import { runCheck } from "./commands/check/index.js";
import { runInit } from "./commands/init/index.js";
import { runTest } from "./commands/test/index.js";
import { runFmt } from "./commands/fmt/index.js";
import type { GlobalFlags } from "./flags.js";
import { failUsage } from "./utils/cli-error.js";
import { SPEC, type Option } from "./options.js";

const program = new Command();
const { config, configPath } = loadConfig(process.cwd());

// ---- helpers SPEC → commander (sin duplicar y con .choices en enums) ----
function registerOptions(cmd: Command, opts: Option[]) {
  for (const o of opts) {
    const names = [o.name, ...(o.aliases ?? [])];
    const shorts = names.filter((n) => /^-[a-zA-Z]$/.test(n));
    const longs = names.filter((n) => /^--/.test(n));
    const primaryLong = longs[0] ?? undefined;
    // token de valor según tipo
    const needsValue =
      o.kind === "string" || o.kind === "number" || o.kind === "enum";
    const valueToken =
      o.kind === "enum"
        ? `<${primaryLong ? primaryLong.replace(/^--/, "") : "value"}:${(o.enumValues ?? []).join("|")}>`
        : o.kind === "number"
          ? `<number>`
          : needsValue
            ? `<value>`
            : "";
    // construimos un único flags string con todos los alias
    const parts: string[] = [];
    for (const s of shorts) parts.push(s);
    if (primaryLong)
      parts.push(primaryLong + (valueToken ? ` ${valueToken}` : ""));
    for (let i = 1; i < longs.length; i++) parts.push(longs[i]); // otros longs sin token
    const flags = parts.join(", ");
    // Creamos una Option para poder aplicar choices
    const opt = new CommanderOption(flags, o.description);
    if (o.kind === "enum" && o.enumValues?.length) {
      opt.choices(o.enumValues);
    }
    cmd.addOption(opt);
  }
}
const GLOBAL_SPEC = SPEC.groups.find((g) => g.id === "global")!;
const BUILD_SPEC = SPEC.groups.find((g) => g.id === "build");
const TEST_SPEC = SPEC.groups.find((g) => g.id === "test");
const INIT_SPEC = SPEC.groups.find((g) => g.id === "init");
const FMT_SPEC = SPEC.groups.find((g) => g.id === "fmt");

program
  .name("intent")
  .description("A CLI for the IntentLang compiler and test runner.");

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

// Inyecta el resto de flags globales desde SPEC (evita duplicar las que ya tienen short)
registerOptions(program, GLOBAL_SPEC.options);

program
  .command("build")
  .description("Compile .il files to TypeScript or JavaScript.")
  .argument("[files...]", "Files or glob patterns to process")
  // flags de build desde SPEC (incluye --out y alias --outDir, --target, --sourcemap)
  .hook("preAction", (thisCmd) => {
    if (BUILD_SPEC) registerOptions(thisCmd, BUILD_SPEC.options);
  })
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
  .command("init")
  .description(
    "Initialize a new IntentLang project in the given directory (default: .).",
  )
  .argument("[dir]", "Target directory", ".")
  .hook("preAction", (thisCmd) => {
    if (INIT_SPEC) registerOptions(thisCmd, INIT_SPEC.options);
  })
  .action(async (dir: string, _options: unknown, command: Command) => {
    const globals = command.optsWithGlobals?.() ?? {
      ...program.opts(),
      ...command.opts?.(),
    };
    const finalFlags = { ...globalDefaults, ...globals } as any;
    setColors(!finalFlags.noColor);
    await runInit(dir, finalFlags);
  });

program
  .command("test")
  .description("Run tests defined in .il files.")
  .argument("[files...]", "Files or glob patterns to process")
  .hook("preAction", (thisCmd) => {
    if (TEST_SPEC) registerOptions(thisCmd, TEST_SPEC.options);
  })
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

program
  .command("fmt")
  .description("Format IntentLang source files.")
  .argument("[files...]", "Files or glob patterns")
  .hook("preAction", (thisCmd) => {
    if (FMT_SPEC) registerOptions(thisCmd, FMT_SPEC.options);
  })
  .action(async (files: string[], _options: unknown, command: Command) => {
    const globals = command.optsWithGlobals?.() ?? {
      ...program.opts(),
      ...command.opts?.(),
    };
    const merged = { ...globals };
    const finalFlags = { ...globalDefaults, ...merged } as any;
    setColors(!finalFlags.noColor);
    const filesToProcess = finalFlags.stdin
      ? ["-"] // sentinel para stdin
      : getFilesToProcess(files, finalFlags);
    await runFmt(filesToProcess, finalFlags);
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
