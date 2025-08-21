#!/usr/bin/env node
import {
  parseGlobalFlags,
  GLOBAL_FLAGS_HELP,
  type GlobalFlags,
} from "./flags.js";
import { runCheck } from "./commands/check/index.js";
import type { BuildFlags } from "./commands/build/types.js";
import { runBuild } from "./commands/build/index.js";
import type { TestFlags } from "./commands/test/types.js";
import { runTest } from "./commands/test/index.js";
import { setColors } from "./term/colors.js";
import { loadConfig } from "./config/index.js";
import { expandInputsFromConfig } from "./config/expand.js";
import { expandInputs } from "./commands/check/helpers.js";

function usage(): never {
  console.error(
    `Usage: ilc <check|build|test> [files...] [flags]

If no files are provided, 'ilc' will use 'include'/'exclude' from ilconfig.json.

Global flags:
${GLOBAL_FLAGS_HELP}

Build flags:
  --target ts|js|py   Output target (default: ts)
  --out DIR           Output directory (default: dist)
  --sourcemap         Emit source maps when --target js

Test flags:
  --only PATTERN      Run tests matching PATTERN
  --bail              Stop on first failure
  --reporter json|human (human by default; --json implies json)
`,
  );
  process.exit(2);
}

function parseBuildFlags(rest: string[], base: GlobalFlags): BuildFlags {
  const buildFlags: Partial<BuildFlags> = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--target") buildFlags.target = rest[++i] as any;
    else if (a === "--out") buildFlags.outDir = rest[++i];
    else if (a === "--sourcemap") buildFlags.sourcemap = true;
  }

  // Fusiona y aplica valores por defecto para satisfacer el tipo BuildFlags.
  const merged = { ...base, ...buildFlags };
  if (!merged.target) merged.target = "ts";
  if (!merged.outDir) merged.outDir = "dist";

  return merged as BuildFlags;
}

function parseTestFlags(rest: string[], base: GlobalFlags): TestFlags {
  const testFlags: Partial<TestFlags> = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--only") testFlags.only = rest[++i];
    else if (a === "--bail") testFlags.bail = true;
    else if (a === "--reporter") testFlags.reporter = rest[++i] as any;
  }

  const merged = { ...base, ...testFlags };
  const effReporter = merged.json ? "json" : (merged.reporter ?? "human");
  return { ...merged, reporter: effReporter };
}

async function main() {
  const argv = process.argv.slice(2);
  const [cmd, ...args] = argv;
  if (!cmd) usage();

  // 1. Cargar configuración desde ilconfig.json
  const { config, configPath } = loadConfig(process.cwd());

  // 2. Parsear flags de la línea de comandos
  const { flags: cliFlags, rest: cliRest } = parseGlobalFlags(args);

  // 3. Convertir seeds numéricos a string antes de fusionar para evitar errores de tipo.
  const configOptions = { ...config.compilerOptions };
  if (typeof configOptions.seedRng === "number") {
    configOptions.seedRng = String(configOptions.seedRng);
  }
  if (typeof configOptions.seedClock === "number") {
    configOptions.seedClock = String(configOptions.seedClock);
  }

  // 4. Fusionar configuraciones (los flags de CLI tienen prioridad)
  const finalFlags: GlobalFlags = { ...configOptions, ...cliFlags };

  // 5. Determinar los archivos a procesar
  const fileArgs = cliRest.filter((arg) => !arg.startsWith("-"));
  let filesToProcess: string[];

  if (fileArgs.length > 0) {
    filesToProcess = expandInputs(fileArgs);
  } else if (config.include) {
    filesToProcess = expandInputsFromConfig(
      config.include,
      config.exclude,
      configPath,
    );
  } else {
    usage();
  }

  if (finalFlags.noColor) {
    setColors(false);
  }

  if (
    filesToProcess.length === 0 &&
    !(fileArgs.length === 1 && fileArgs[0] === "-")
  ) {
    console.error(
      "Error: No input files found matching the specified patterns.",
    );
    process.exit(2);
  }

  // 6. Ejecutar el comando
  switch (cmd) {
    case "check": {
      await runCheck(filesToProcess, finalFlags);
      break;
    }
    case "build": {
      const flags = parseBuildFlags(cliRest, finalFlags);
      await runBuild(filesToProcess, flags);
      break;
    }
    case "test": {
      const flags = parseTestFlags(cliRest, finalFlags);
      await runTest(filesToProcess, flags);
      break;
    }
    default:
      usage();
  }
}

main().catch((err) => {
  console.error(err?.stack ?? String(err));
  process.exit(1);
});
