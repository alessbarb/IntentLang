#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { parse, check as checkProgram, emitTypeScript } from "@il/core";

function usage(): never {
  console.error("Usage: ilc <check|build|test> file.il [--target ts] [--out dir]");
  process.exit(1);
}

function read(file: string): string {
  return fs.readFileSync(file, "utf8");
}

const [, , cmd, file, ...rest] = process.argv;
if (!cmd) usage();

switch (cmd) {
  case "check": {
    if (!file) usage();
    const program = parse(read(file));
    checkProgram(program);
    console.log("OK");
    break;
  }
  case "build": {
    if (!file) usage();
    let target = "ts";
    let outDir = "dist";
    for (let i = 0; i < rest.length; i += 2) {
      const flag = rest[i];
      const val = rest[i + 1];
      if (flag === "--target") target = val;
      else if (flag === "--out") outDir = val;
    }
    const program = parse(read(file));
    checkProgram(program);
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
    const program = parse(read(file));
    checkProgram(program);
    const code = emitTypeScript(program);
    const js = ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
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
