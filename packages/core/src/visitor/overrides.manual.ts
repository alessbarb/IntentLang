// src/visitor/overrides.manual.ts
import type { CstToAst } from "./cst-to-ast.js";
export type VisitorOverrides = Partial<
  Pick<
    CstToAst,
    "visitUseDecl" | "visitIntentSection" | "visitTypeDecl" // añade las que quieras
  >
>;

export const overrides: VisitorOverrides = {
  // ejemplo:
  // visitIntentSection(this: CstToAst, ctx: any) { ... return super.visitIntentSection(ctx) ... }
};
