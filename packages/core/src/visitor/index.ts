// src/visitor/index.ts
import { CstToAst } from "./cst-to-ast.js";
import { overrides } from "./overrides.manual.js";

class AstVisitor extends CstToAst {}
const baseProto = (CstToAst as any).prototype;
const targetProto = (AstVisitor as any).prototype;

for (const [name, fn] of Object.entries(overrides as Record<string, unknown>)) {
  if (typeof fn === "function" && typeof baseProto[name] === "function") {
    targetProto[name] = fn;
  }
}
export { AstVisitor };
