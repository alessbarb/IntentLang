#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import {
  parse,
  check as checkProgram,
  emitTypeScript,
  initRuntime,
} from "@il/core";

function printDiagnostics(
  diags: import("@il/core").Diagnostic[],
  strict = false,
) {
  const hasErr = diags.some((d) => d.level === "error");
  const hasWarn = diags.some((d) => d.level === "warning");
  for (const d of diags) {
    const where = d.span
      ? ` at ${d.span.start.line}:${d.span.start.column}`
      : "";
    const tag = d.level === "error" ? "[ERROR]" : "[WARN ]";
    console.error(`${tag} ${d.message}${where}`);
  }
  if (hasErr || (strict && hasWarn)) {
    process.exitCode = 1;
  }
}

function usage(): never {
  console.error(
    "Usage: ilc <check|build|test> file.il [--strict] [--target ts] [--out dir] [--seed-rng n] [--seed-clock n]",
  );
  process.exit(2);
}

function read(file: string): string {
  return fs.readFileSync(file, "utf8");
}

const [, , cmd, file, ...rest] = process.argv;
if (!cmd) usage();

switch (cmd) {
  case "check": {
    if (!file) usage();
    if (rest.some((f) => f.startsWith("--") && f !== "--strict")) usage();
    if (!fs.existsSync(file)) usage();
    const strict = rest.includes("--strict");
    const program = parse(read(file));
    const diags = checkProgram(program);
    printDiagnostics(diags, strict);
    if (process.exitCode !== 1) console.log("OK");
    break;
  }
  case "build": {
    if (!file) usage();
    let target = "ts";
    let outDir = "dist";
    let seedRng: number | undefined;
    let seedClock: number | undefined;
    for (let i = 0; i < rest.length; i += 2) {
      const flag = rest[i];
      const val = rest[i + 1];
      if (flag === "--target") target = val;
      else if (flag === "--out") outDir = val;
      else if (flag === "--seed-rng") seedRng = Number(val);
      else if (flag === "--seed-clock") seedClock = Number(val);
    }
    initRuntime({ seedRng, seedClock });
    const strict = rest.includes("--strict");
    const program = parse(read(file));
    const diags = checkProgram(program);
    printDiagnostics(diags, strict);
    if (process.exitCode === 1) break;
    if (target !== "ts") {
      console.error(`Unsupported target: ${target}`);
      process.exit(2);
    }
    const out = emitTypeScript(program);
    fs.mkdirSync(outDir, { recursive: true });
    const base = path.basename(file).replace(/\.il$/, ".ts");
    const dest = path.join(outDir, base);
    fs.writeFileSync(dest, out, "utf8");
    console.log(`Built: ${dest}`);
    break;
  }
  case "test": {
    if (!file) usage();
    let seedRng: number | undefined;
    let seedClock: number | undefined;
    for (let i = 0; i < rest.length; i += 2) {
      const flag = rest[i];
      const val = rest[i + 1];
      if (flag === "--seed-rng") seedRng = Number(val);
      else if (flag === "--seed-clock") seedClock = Number(val);
    }
    initRuntime({ seedRng, seedClock });
    const strict = rest.includes("--strict");
    const program = parse(read(file));
    const diags = checkProgram(program);
    printDiagnostics(diags, strict);
    if (process.exitCode === 1) break;
    const code = emitTypeScript(program);
    const js = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText;
    const sandbox: any = { exports: {}, console, process };
    vm.runInNewContext(js, sandbox);
    const tests = Object.entries(sandbox.exports).filter(
      ([name, fn]) => name.startsWith("test_") && typeof fn === "function",
    );
    for (const [name, fn] of tests) {
      try {
        await (fn as any)();
        console.log(`✓ ${name}`);
      } catch (err) {
        console.error(`✗ ${name}:`, err);
        process.exitCode = 1;
      }
    }
    break;
  }
  default:
    usage();
}
