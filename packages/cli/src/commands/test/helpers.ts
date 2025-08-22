// Refactorization Notes:
// Replaced duplicated file processing with shared utility function.

import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import _ from "lodash";
import { parse, check as checkProgram, emitTypeScript } from "@intentlang/core";
import { isIlFile, processFiles } from "../../utils/files.js";
import type {
  TestFlags,
  TestResult,
  ProgramInfo,
  Diagnostic,
} from "./types.js";

export { isIlFile, processFiles };

/** Ejecuta los tests de los programas compilados en un sandbox. */
export async function executeTests(
  programs: ProgramInfo[],
  flags: TestFlags,
): Promise<TestResult[]> {
  const onlyRe = flags.only ? new RegExp(_.escapeRegExp(flags.only)) : null;
  const results: TestResult[] = [];

  for (const { program } of programs) {
    const tsCode = emitTypeScript(program);
    const js = ts.transpileModule(tsCode, {
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
      if (onlyRe && !onlyRe.test(name)) continue;
      try {
        await (fn as any)();
        results.push({ name, ok: true });
      } catch (err: any) {
        results.push({ name, ok: false, error: String(err?.message ?? err) });
        if (flags.bail) break;
      }
    }
    if (flags.bail && results.some((r) => !r.ok)) break;
  }

  return results;
}
