#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd()); // packages/core
const SRC = path.join(ROOT, "src");
const PARSER_DIR = path.join(SRC, "parser");
const GLUE = path.join(PARSER_DIR, "visitor.ts");
const MANUAL = path.join(SRC, "manual", "visitor.manual.ts");

const header = `/* AUTO-GENERATED: DO NOT EDIT.
 * Visitor composition (per-method overrides):
 * - Base: AstBuilder generado.
 * - Si ../manual/visitor.manual.ts exporta:
 *     a) const overrides: VisitorOverrides = { visitX(ctx) { ... }, ... }
 *     b) o funciones sueltas con nombres de métodos del builder
 *   entonces se sobreescriben solo esos métodos.
 */`;

const GLUE_WITH_MANUAL = `${header}

import { AstBuilder as GeneratedAstBuilder } from "../_generated/ast.builder.js";
import * as M from "../manual/visitor.manual.js";

type Methods<T> = { [K in keyof T as T[K] extends (...a: any[]) => any ? K : never]: T[K] };
export type VisitorOverrides = Partial<Methods<GeneratedAstBuilder>>;

const _mod: any = M;
const overrides: VisitorOverrides =
  (_mod?.overrides && typeof _mod.overrides === "object")
    ? _mod.overrides as VisitorOverrides
    : Object.fromEntries(
        Object.entries(_mod).filter(
          ([k, v]) => typeof v === "function" && typeof (GeneratedAstBuilder as any).prototype[k] === "function",
        )
      ) as VisitorOverrides;

class AstVisitor extends GeneratedAstBuilder {}
const baseProto = (GeneratedAstBuilder as any).prototype;
const targetProto = (AstVisitor as any).prototype;

for (const [name, fn] of Object.entries(overrides as Record<string, unknown>)) {
  if (typeof fn === "function" && typeof baseProto[name] === "function") {
    targetProto[name] = fn;
  }
}

export { AstVisitor };
`;

const GLUE_AUTO_ONLY = `${header}

export { AstBuilder as AstVisitor } from "../_generated/ast.builder.js";
`;

fs.mkdirSync(PARSER_DIR, { recursive: true });
const hasManual = fs.existsSync(MANUAL);
fs.writeFileSync(GLUE, hasManual ? GLUE_WITH_MANUAL : GLUE_AUTO_ONLY, "utf8");
console.log(
  `✅ parser glue generado: ${path.relative(ROOT, GLUE)} ` +
    (hasManual ? "(auto + overrides por método)" : "(solo auto)"),
);
