#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  parseGlobalFlags,
  GLOBAL_FLAGS_HELP,
  type GlobalFlags,
} from "./flags.js";
import { runCheck } from "./commands/check.js";
import { runBuild, type BuildFlags } from "./commands/build.js";
import { runTest, type TestFlags } from "./commands/test.js";

function usage(): never {
  console.error(
    `Usage: ilc <check|build|test> <files...> [flags]

Global flags:
${GLOBAL_FLAGS_HELP}

Build flags:
  --target ts|js    Output target (default: ts)
  --out DIR         Output directory (default: dist)
  --sourcemap       Emit source maps when --target js

Test flags:
  --only PATTERN    Run tests matching PATTERN
  --bail            Stop on first failure
  --reporter json|human  (human by default; --json implies json)
`,
  );
  process.exit(2);
}

const argv = process.argv.slice(2);
const [cmd, ...args] = argv;
if (!cmd) usage();

const { flags: global, rest } = parseGlobalFlags(args);

function parseBuild(
  rest: string[],
  base: GlobalFlags,
): { files: string[]; flags: BuildFlags } {
  let target: "ts" | "js" = "ts";
  let outDir = "dist";
  let sourcemap = false;
  const files: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--target") target = (rest[++i] as any) ?? "ts";
    else if (a === "--out") outDir = rest[++i] ?? "dist";
    else if (a === "--sourcemap") sourcemap = true;
    else if (a.startsWith("-"))
      usage(); // flag desconocida ⇒ uso
    else files.push(a);
  }
  if (files.length === 0 || files.some((f) => !fs.existsSync(f))) usage();
  return { files, flags: { ...base, target, outDir, sourcemap } };
}

function parseTest(
  rest: string[],
  base: GlobalFlags,
): { files: string[]; flags: TestFlags } {
  let only: string | undefined;
  let bail = false;
  let reporter: "json" | "human" | undefined;
  const files: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--only") only = rest[++i];
    else if (a === "--bail") bail = true;
    else if (a === "--reporter") reporter = rest[++i] as any;
    else if (a.startsWith("-"))
      usage(); // flag desconocida
    else files.push(a);
  }
  if (files.length === 0 || files.some((f) => !fs.existsSync(f))) usage();
  const effReporter = base.json ? "json" : (reporter ?? "human");
  return { files, flags: { ...base, only, bail, reporter: effReporter } };
}

function parseCheck(rest: string[]): string[] {
  const files: string[] = [];
  const looksLikeGlob = (s: string) => /[*?\[]/.test(s);
  for (let i = 0; i < rest.length; i++) {
    let a = rest[i];
    // strip surrounding quotes to support quoted globs on Windows
    if ((a.startsWith("\"") && a.endsWith("\"")) || (a.startsWith("'") && a.endsWith("'"))) {
      a = a.slice(1, -1);
    }
    if (a === "-") files.push(a);
    else if (a.startsWith("-")) usage(); // 'check' has no specific flags
    else files.push(a);
  }
  if (files.length === 0) usage();
  if (files.includes("-")) {
    if (files.length > 1) usage();
    return ["-"];
  }
  // Permite globs/directorios; solo exige existencia cuando no parece glob
  if (files.some((f) => !looksLikeGlob(f) && !fs.existsSync(f))) usage();
  return files;
}

(async () => {
  switch (cmd) {
    case "check": {
      const files = parseCheck(rest);
      await runCheck(files, global);
      break;
    }
    case "build": {
      const { files, flags } = parseBuild(rest, global);
      await runBuild(files, flags);
      break;
    }
    case "test": {
      const { files, flags } = parseTest(rest, global);
      await runTest(files, flags);
      break;
    }
    default:
      usage();
  }
})().catch((err) => {
  console.error(err?.stack ?? String(err));
  process.exit(2);
});
