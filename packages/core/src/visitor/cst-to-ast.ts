// src/visitor/cst-to-ast.ts
import type { Token, ParserRuleContext } from "antlr4ng";
import { AbstractParseTreeVisitor } from "antlr4ng";

import { IntentLangLexer } from "../_generated/grammar/IntentLangLexer.js";
import { IntentLangParser } from "../_generated/grammar/IntentLangParser.js";
import type { IntentLangParserVisitor } from "../_generated/grammar/IntentLangParserVisitor.js";

import * as AST from "../ast.js";
import { spanFromCtx, spanFromTokens, type Span } from "../pos.js";

function unquote(s: string) {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  )
    return s.slice(1, -1);
  return s;
}
function id(tok: Token): AST.Identifier {
  const s = spanFromTokens(tok, tok);
  return { kind: "Identifier", name: tok.text ?? "", span: s };
}

export class CstToAst extends AbstractParseTreeVisitor<any> {
  public visit(node: unknown): any {
    return super.visit(node as any);
  }

  protected defaultResult(): any {
    return undefined;
  }

  // ajusta el nombre de la regla: file / program / compilationUnit…
  visitFile(ctx: any): AST.Program {
    const items: AST.TopItem[] = [];

    const intent = ctx.intentSection
      ? this.visitIntentSection(ctx.intentSection())
      : undefined;
    const uses = ctx.usesSection
      ? this.visitUsesSection(ctx.usesSection())
      : undefined;
    const types = ctx.typesSection
      ? this.visitTypesSection(ctx.typesSection())
      : undefined;

    // TODO: empujar aquí otros top-level (func/effect/test) cuando estén listos

    return {
      kind: "Program",
      span: spanFromCtx(ctx),
      intent,
      uses,
      types,
      items,
    };
  }

  visitIntentSection(ctx: any): AST.IntentSection {
    const description = unquote(ctx.string().STRING().getText());
    const tags = ctx.tagList
      ? (ctx.tagList().string() || []).map((t: any) =>
          unquote(t.STRING().getText()),
        )
      : undefined;
    return { kind: "IntentSection", description, tags, span: spanFromCtx(ctx) };
  }

  visitUsesSection(ctx: any): AST.UsesSection {
    const entries = (ctx.useDecl() || []).map((d: any) => this.visitUseDecl(d));
    return { kind: "UsesSection", entries, span: spanFromCtx(ctx) };
  }

  visitUseDecl(ctx: any): AST.UseDecl {
    const name = id(ctx.ident(0).IDENT().symbol);
    const typeName = id(ctx.ident(1).IDENT().symbol);
    const params: Record<string, AST.Literal> = {};
    if (ctx.objectExpr) {
      for (const f of ctx.objectExpr().recordFieldList()?.recordField() || []) {
        const key = f.ident().IDENT().getText();
        const v = this.visitExpr(f.expr());
        if (v.kind === "LiteralExpr") params[key] = v.value as AST.Literal;
      }
    }
    return { kind: "UseDecl", name, typeName, params, span: spanFromCtx(ctx) };
  }

  visitTypesSection(ctx: any): AST.TypesSection {
    const declarations: AST.TypeDecl[] = (ctx.typeDecl() || []).map((t: any) =>
      this.visitTypeDecl(t),
    );
    return { kind: "TypesSection", declarations, span: spanFromCtx(ctx) };
  }

  visitTypeDecl(ctx: any): AST.TypeDecl {
    const name = id(ctx.ident().IDENT().symbol);
    const expr = this.visitTypeExpr(ctx.typeExpr());
    const refinement = ctx.refinementExpr
      ? ctx.refinementExpr().getText()
      : undefined;
    return { kind: "TypeDecl", name, expr, refinement, span: spanFromCtx(ctx) };
  }

  // ==== tipos ====
  visitTypeExpr(ctx: any): AST.TypeExpr {
    if (ctx.unionType) return this.visitUnionType(ctx.unionType());
    return this.visitNonUnionType(ctx.nonUnionType());
  }

  visitNonUnionType(ctx: any): AST.TypeExpr {
    const base = this.visitBrandableType(ctx.brandableType());
    if (ctx.string) {
      return {
        kind: "BrandType",
        base: base,
        brand: unquote(ctx.string().STRING().getText()),
        span: spanFromCtx(ctx),
      };
    }
    return base;
  }

  visitBrandableType(ctx: any): AST.TypeExpr {
    if (ctx.recordType) return this.visitRecordType(ctx.recordType());
    if (ctx.genericType) return this.visitGenericType(ctx.genericType());
    if (ctx.typeRef) return this.visitTypeRef(ctx.typeRef());
    if (ctx.basicType) return this.visitBasicType(ctx.basicType());
    if (ctx.literalType) return this.visitLiteralType(ctx.literalType());
    // añade func/array/map si están en tu gramática
    throw new Error(`brandableType desconocido: ${ctx.getText()}`);
  }

  visitUnionType(ctx: any): AST.UnionType {
    const ctors = (ctx.unionCtor() || []).map((c: any) =>
      this.visitUnionCtor(c),
    );
    return { kind: "UnionType", ctors, span: spanFromCtx(ctx) };
  }

  visitUnionCtor(ctx: any): AST.UnionCtor {
    if (ctx.literalType) {
      const literal = this.visitLiteralType(ctx.literalType());
      return { kind: "LiteralCtor", literal, span: literal.span };
    }
    const name = id(ctx.ident().IDENT().symbol);
    const fields = ctx.recordType
      ? this.visitRecordType(ctx.recordType())
      : undefined;
    return { kind: "NamedCtor", name, fields, span: spanFromCtx(ctx) };
  }

  visitRecordType(ctx: any): Extract<AST.TypeExpr, { kind: "RecordType" }> {
    const fields: AST.RecordField[] = (ctx.fieldList()?.fieldDecl() || []).map(
      (f: any) => this.visitFieldDecl(f),
    );
    return { kind: "RecordType", fields, span: spanFromCtx(ctx) };
  }

  visitFieldDecl(ctx: any): AST.RecordField {
    const name = id(ctx.ident().IDENT().symbol);
    const type = this.visitTypeExpr(ctx.typeExpr());
    const refinement = ctx.refinementExpr
      ? ctx.refinementExpr().getText()
      : undefined;
    return {
      kind: "RecordField",
      name,
      type,
      refinement,
      span: spanFromCtx(ctx),
    };
  }

  visitGenericType(ctx: any): AST.GenericType {
    const name = id(ctx.ident().IDENT().symbol);
    const params = (ctx.typeExpr() || []).map((t: any) =>
      this.visitTypeExpr(t),
    );
    return { kind: "GenericType", name, params, span: spanFromCtx(ctx) };
  }

  visitTypeRef(ctx: any): AST.TypeExpr {
    if (ctx.ident)
      return {
        kind: "GenericType",
        name: id(ctx.ident().IDENT().symbol),
        params: [],
        span: spanFromCtx(ctx),
      };
    return this.visitTypeExpr(ctx.typeExpr());
  }

  visitBasicType(ctx: any): AST.BasicType {
    return {
      kind: "BasicType",
      name: ctx.getText() as AST.BasicType["name"],
      span: spanFromCtx(ctx),
    };
  }

  visitLiteralType(ctx: any): Extract<AST.TypeExpr, { kind: "LiteralType" }> {
    return {
      kind: "LiteralType",
      value: unquote(ctx.string().STRING().getText()),
      span: spanFromCtx(ctx),
    };
  }

  // ==== (si necesitas expresiones para parámetros de uses) ====
  visitExpr(ctx: any): any {
    return this.visitPrimary(ctx.primary());
  }
  visitPrimary(ctx: any): any {
    if (ctx.literal)
      return {
        kind: "LiteralExpr",
        value: this.visitLiteral(ctx.literal()),
        span: spanFromCtx(ctx),
      };
    if (ctx.ident)
      return {
        kind: "IdentifierExpr",
        id: id(ctx.ident().IDENT().symbol),
        span: spanFromCtx(ctx),
      };
    throw new Error("primary no soportado aún");
  }
  visitLiteral(ctx: any): AST.Literal {
    const s = spanFromCtx(ctx);
    if (ctx.bool)
      return { kind: "Bool", value: ctx.bool().getText() === "true", span: s };
    if (ctx.int || ctx.float)
      return { kind: "Number", value: parseFloat(ctx.getText()), span: s };
    if (ctx.string)
      return {
        kind: "String",
        value: unquote(ctx.string().getText()),
        span: s,
      };
    throw new Error("literal no soportado");
  }
}
