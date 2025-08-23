// @manual: Hand-written visitor logic, do not overwrite.

import type {
  Program,
  IntentSection,
  UsesSection,
  UseDecl,
  TypesSection,
  TypeDecl,
  TypeExpr,
  BasicType,
  BrandType,
  RecordType,
  RecordField,
  UnionType,
  UnionCtor,
  GenericType,
  LiteralType,
  Identifier,
  FuncDecl,
  EffectDecl,
  TestDecl,
  ParamSig,
  Block,
  Stmt,
  LetStmt,
  ReturnStmt,
  IfStmt,
  MatchStmt,
  ForStmt,
  ExprStmt,
  Expr,
  Literal,
  LiteralExpr,
  IdentifierExpr,
  ObjectExpr,
  ObjectField,
  ArrayExpr,
  CallExpr,
  MemberExpr,
  UnaryExpr,
  BinaryExpr,
  ResultOkExpr,
  ResultErrExpr,
  OptionSomeExpr,
  OptionNoneExpr,
  BrandCastExpr,
  VariantExpr,
  MatchExpr,
  CaseClause,
  Pattern,
  PatternField,
  VariantPattern,
  LiteralPattern,
  Span,
} from "../ast.js";

import type { Token } from "antlr4ts/Token.js";
import type { ParserRuleContext } from "antlr4ts/ParserRuleContext.js";
import { TerminalNode } from "antlr4ts/tree/TerminalNode.js";
import { ErrorNode } from "antlr4ts/tree/ErrorNode.js";
import { AstBuilderVisitorBase } from "./visitor.gen.js";

// Utilidades para Span a partir de ctx/tokens
function spanFromCtx(ctx: ParserRuleContext): Span {
  const s = ctx.start;
  const e = ctx.stop ?? ctx.start;
  return spanFromTokens(s, e);
}
function spanFromTokens(start: Token, stop: Token): Span {
  return {
    start: {
      line: start.line,
      column: start.charPositionInLine + 1,
      index: start.startIndex ?? 0,
    },
    end: {
      line: stop.line,
      column: (stop.charPositionInLine ?? 0) + (stop.text?.length ?? 1),
      index: stop.stopIndex ?? start.startIndex ?? 0,
    },
  };
}
function id(nameTok: Token): Identifier {
  const s = spanFromTokens(nameTok, nameTok);
  return { kind: "Identifier", name: nameTok.text ?? "", span: s };
}

// Mapea operadores (ajusta según tus tokens/rules reales)
const BIN_OPS: Record<string, BinaryExpr["op"]> = {
  "||": "||",
  "&&": "&&",
  "|": "|",
  "^": "^",
  "&": "&",
  "==": "==",
  "!=": "!=",
  "<": "<",
  "<=": "<=",
  ">": ">",
  ">=": ">=",
  "<<": "<<",
  ">>": ">>",
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
  "%": "%",
};

const ASSIGN_OPS = new Set(["=", "+=", "-=", "*=", "/=", "%="]);

export class AstBuilderVisitor extends AstBuilderVisitorBase {
  // ---- Helpers ----
  visit(ctx: any): any {
    return ctx.accept(this);
  }

  visitChildren(ctx: ParserRuleContext): any {
    let result: any;
    const n = ctx.childCount;
    for (let i = 0; i < n; i++) {
      const child: any = ctx.getChild(i);
      result = child.accept(this);
    }
    return result;
  }

  visitMatchStmt(ctx: any): MatchStmt {
    const s = spanFromCtx(ctx);
    const m = this.visitMatchExpr(ctx.matchExpr?.() ?? ctx);
    return { kind: "MatchStmt", expr: m.expr, cases: m.cases, span: s };
  }

  visitTerminal(node: TerminalNode): any {
    // comportamiento por defecto: no hace nada especial
    return undefined;
  }

  visitErrorNode(node: ErrorNode): any {
    // si prefieres, lanza o acumula errores aquí
    return undefined;
  }

  // ========== Program ==========
  visitProgram(ctx: any): Program {
    // Asume que el árbol tiene una lista de items (sections + decls).
    // Busca los hijos por tipos de contexto según tu .g4
    const items: Array<
      | FuncDecl
      | EffectDecl
      | TestDecl
      | TypesSection
      | UsesSection
      | IntentSection
    > = [];

    for (let i = 0; i < ctx.getChildCount(); i++) {
      const ch: any = ctx.getChild(i);
      const name = ch.constructor?.name ?? "";

      switch (name) {
        case "IntentSectionContext":
          items.push(this.visitIntentSection(ch));
          break;
        case "UsesSectionContext":
          items.push(this.visitUsesSection(ch));
          break;
        case "TypesSectionContext":
          items.push(this.visitTypesSection(ch));
          break;
        case "FuncDeclContext":
          items.push(this.visitFuncDecl(ch));
          break;
        case "EffectDeclContext":
          items.push(this.visitEffectDecl(ch));
          break;
        case "TestDeclContext":
          items.push(this.visitTestDecl(ch));
          break;
        default:
          // ignora WS/EOF/etc.
          break;
      }
    }

    // Opcional: extrae las secciones específicas si tu AST las quiere separadas.
    const intent = items.find((i) => i?.kind === "IntentSection") as
      | IntentSection
      | undefined;
    const uses = items.find((i) => i?.kind === "UsesSection") as
      | UsesSection
      | undefined;
    const types = items.find((i) => i?.kind === "TypesSection") as
      | TypesSection
      | undefined;

    return {
      kind: "Program",
      intent,
      uses,
      types,
      items,
      span: spanFromCtx(ctx),
    };
  }

  // ========== Sections ==========
  visitIntentSection(ctx: any): IntentSection {
    // Ajusta getters: description STRING, optional tags [...]
    const s = spanFromCtx(ctx);
    const description = this.extractStringLiteral(ctx.STRING?.());
    const tags = this.extractStringArray(ctx.tagsList?.()); // adapta a tu regla real
    return { kind: "IntentSection", description, tags, span: s };
  }

  visitUsesSection(ctx: any): UsesSection {
    const s = spanFromCtx(ctx);
    const entries: UseDecl[] = [];
    for (const declCtx of ctx.useDecl?.() ?? []) {
      entries.push(this.visitUseDecl(declCtx));
    }
    return { kind: "UsesSection", entries, span: s };
  }
  visitUseDecl(ctx: any): UseDecl {
    const s = spanFromCtx(ctx);
    const name = id(ctx.IDENT()?.symbol);
    const typeName = id(
      ctx.typeName?.().IDENT()?.symbol ?? ctx.IDENT(1)?.symbol,
    );
    const params: Record<string, Literal> = {};
    for (const pctx of ctx.paramPair?.() ?? []) {
      const key = id(pctx.IDENT().symbol).name;
      params[key] = this.visitLiteral(pctx.literal?.());
    }
    return { kind: "UseDecl", name, typeName, params, span: s };
  }

  visitTypesSection(ctx: any): TypesSection {
    const s = spanFromCtx(ctx);
    const declarations: TypeDecl[] = [];
    for (const tctx of ctx.typeDecl?.() ?? []) {
      declarations.push(this.visitTypeDecl(tctx));
    }
    return { kind: "TypesSection", declarations, span: s };
  }

  visitTypeDecl(ctx: any): TypeDecl {
    const s = spanFromCtx(ctx);
    const name = id(ctx.IDENT()?.symbol);
    const expr = this.visitTypeExpr(ctx.typeExpr?.());
    const refinement = this.extractRefinement(ctx.refinementClause?.());
    return { kind: "TypeDecl", name, expr, refinement, span: s };
  }

  // ========== TypeExpr ==========
  visitTypeExpr(ctx: any): TypeExpr {
    // Decide por el hijo que exista
    if (ctx.unionType) return this.visitUnionType(ctx.unionType());
    if (ctx.recordType) return this.visitRecordType(ctx.recordType());
    if (ctx.literalType) return this.visitLiteralType(ctx.literalType());
    if (ctx.genericType) return this.visitGenericType(ctx.genericType());
    if (ctx.namedType) return this.visitNamedType(ctx.namedType());
    throw new Error("Invalid type expression");
  }

  visitUnionType(ctx: any): UnionType {
    const s = spanFromCtx(ctx);
    const ctors: UnionCtor[] = [];
    for (const c of ctx.unionCtor?.() ?? []) {
      if (c.STRING) {
        const lit = this.visitLiteralType(c.literalType?.());
        ctors.push({ kind: "LiteralCtor", literal: lit, span: lit.span });
      } else {
        const name = id(c.IDENT()?.symbol);
        const fields = c.recordType
          ? this.visitRecordType(c.recordType())
          : undefined;
        ctors.push({ kind: "NamedCtor", name, fields, span: name.span });
      }
    }
    return { kind: "UnionType", ctors, span: s };
  }

  visitRecordType(ctx: any): RecordType {
    const s = spanFromCtx(ctx);
    const fields: RecordField[] = [];
    for (const f of ctx.recordField?.() ?? []) {
      const fname = id(f.IDENT()?.symbol);
      const ftype = this.visitTypeExpr(f.typeExpr?.());
      const refinement = this.extractRefinement(f.refinementClause?.());
      fields.push({
        kind: "RecordField",
        name: fname,
        type: ftype,
        refinement,
        span: s,
      });
    }
    return { kind: "RecordType", fields, span: s };
  }

  visitGenericType(ctx: any): GenericType {
    const name = id(ctx.IDENT()?.symbol);
    const params = (ctx.typeExpr?.() ?? []).map((t: any) =>
      this.visitTypeExpr(t),
    );
    return { kind: "GenericType", name, params, span: name.span };
  }

  visitLiteralType(ctx: any): LiteralType {
    const t = ctx.STRING?.().symbol;
    const s = spanFromTokens(t, t);
    return { kind: "LiteralType", value: this.unquote(t.text ?? ""), span: s };
  }

  visitNamedType(ctx: any): TypeExpr {
    const nameTok: Token = ctx.IDENT()?.symbol;
    const n = (nameTok?.text ?? "") as BasicType["name"];
    const basicSet = new Set([
      "Bool",
      "Int",
      "Float",
      "String",
      "Bytes",
      "Uuid",
      "DateTime",
    ]);
    const base: Identifier = id(nameTok);

    if (basicSet.has(n)) {
      const basic: BasicType = { kind: "BasicType", name: n, span: base.span };
      if (ctx.brandClause) {
        const brandName = this.extractStringLiteral(
          ctx.brandClause().STRING?.(),
        );
        const t: BrandType = {
          kind: "BrandType",
          base: basic,
          brand: brandName,
          span: basic.span,
        };
        return t;
      }
      return basic;
    }
    return { kind: "NamedType", name: base, span: base.span };
  }

  // ========== Decls ==========
  visitFuncDecl(ctx: any): FuncDecl {
    const s = spanFromCtx(ctx);
    const name = id(ctx.IDENT()?.symbol);
    const params = (ctx.paramSigList?.().paramSig?.() ?? []).map((p: any) =>
      this.visitParamSig(p),
    );

    // Return type optional (o Unit por defecto)
    let ret: TypeExpr;
    if (ctx.typeExpr) ret = this.visitTypeExpr(ctx.typeExpr());
    else ret = { kind: "BasicType", name: "Unit", span: s };

    let contracts: { requires?: Expr; ensures?: Expr } | undefined;
    if (ctx.requiresClause) {
      contracts = {
        ...(contracts ?? {}),
        requires: this.visitExpr(ctx.requiresClause().expr()),
      };
    }
    if (ctx.ensuresClause) {
      contracts = {
        ...(contracts ?? {}),
        ensures: this.visitExpr(ctx.ensuresClause().expr()),
      };
    }

    const body = this.visitBlock(ctx.block?.());
    return {
      kind: "FuncDecl",
      name,
      params,
      returnType: ret,
      contracts,
      body,
      span: s,
    };
  }

  visitEffectDecl(ctx: any): EffectDecl {
    const s = spanFromCtx(ctx);
    const name = id(ctx.IDENT()?.symbol);
    const params = (ctx.paramSigList?.().paramSig?.() ?? []).map((p: any) =>
      this.visitParamSig(p),
    );

    let ret: TypeExpr;
    if (ctx.typeExpr) ret = this.visitTypeExpr(ctx.typeExpr());
    else ret = { kind: "BasicType", name: "Unit", span: s };

    let contracts: { requires?: Expr; ensures?: Expr } | undefined;
    if (ctx.requiresClause) {
      contracts = {
        ...(contracts ?? {}),
        requires: this.visitExpr(ctx.requiresClause().expr()),
      };
    }
    if (ctx.ensuresClause) {
      contracts = {
        ...(contracts ?? {}),
        ensures: this.visitExpr(ctx.ensuresClause().expr()),
      };
    }

    const uses: Identifier[] = (ctx.usesList?.().IDENT?.() ?? []).map(
      (t: TerminalNode) => id(t.symbol),
    );

    const body = this.visitBlock(ctx.block?.());
    return {
      kind: "EffectDecl",
      name,
      params,
      returnType: ret,
      contracts,
      uses,
      body,
      span: s,
    };
  }

  visitTestDecl(ctx: any): TestDecl {
    const s = spanFromCtx(ctx);
    const name = id(ctx.IDENT()?.symbol);
    const block = this.visitBlock(ctx.block?.());
    return {
      kind: "TestDecl",
      name,
      body: {
        kind: "TestBlock",
        statements: block.statements,
        span: block.span,
      },
      span: s,
    };
  }

  visitParamSig(ctx: any): ParamSig {
    const name = id(ctx.IDENT()?.symbol);
    const type = this.visitTypeExpr(ctx.typeExpr?.());
    return { kind: "ParamSig", name, type, span: name.span };
  }

  // ========== Block & Stmts ==========
  visitBlock(ctx: any): Block {
    const s = spanFromCtx(ctx);
    const statements: Stmt[] = [];
    for (const sc of ctx.stmt?.() ?? []) statements.push(this.visitStmt(sc));
    return { kind: "Block", statements, span: s };
  }

  visitStmt(ctx: any): Stmt {
    const name = ctx.constructor?.name ?? "";
    switch (name) {
      case "LetStmtContext":
        return this.visitLetStmt(ctx);
      case "ReturnStmtContext":
        return this.visitReturnStmt(ctx);
      case "IfStmtContext":
        return this.visitIfStmt(ctx);
      case "MatchStmtContext":
        return this.visitMatchStmt(ctx);
      case "ForStmtContext":
        return this.visitForStmt(ctx);
      default: {
        const expr = this.visitExpr(ctx.expr?.());
        return {
          kind: "ExprStmt",
          expression: expr,
          span: spanFromCtx(ctx),
        } as ExprStmt;
      }
    }
  }

  visitLetStmt(ctx: any): LetStmt {
    const s = spanFromCtx(ctx);
    const idn = id(ctx.IDENT()?.symbol);
    const init = this.visitExpr(ctx.expr?.());
    return { kind: "LetStmt", id: idn, init, span: s };
  }

  visitReturnStmt(ctx: any): ReturnStmt {
    const s = spanFromCtx(ctx);
    const arg = ctx.expr ? this.visitExpr(ctx.expr()) : undefined;
    return { kind: "ReturnStmt", argument: arg, span: s };
  }

  visitIfStmt(ctx: any): IfStmt {
    const s = spanFromCtx(ctx);
    const test = this.visitExpr(ctx.expr?.());
    const consequent = this.visitBlock(ctx.block?.(0));
    const alternate = ctx.block?.(1)
      ? this.visitBlock(ctx.block(1))
      : undefined;
    return { kind: "IfStmt", test, consequent, alternate, span: s };
  }

  visitForStmt(ctx: any): ForStmt {
    const s = spanFromCtx(ctx);
    const iterator = id(ctx.IDENT()?.symbol);
    const iterable = this.visitExpr(ctx.expr?.());
    const body = this.visitBlock(ctx.block?.());
    return { kind: "ForStmt", iterator, iterable, body, span: s };
  }

  // ========== Expressions ==========
  visitExpr(ctx: any): Expr {
    // Suponemos que tu gramática ya separa por precedencias.
    // Si tu start expr es assignmentExpr, llama al método correspondiente:
    return this.visitAssignmentExpr(ctx.assignmentExpr?.() ?? ctx);
  }

  visitAssignmentExpr(ctx: any): Expr {
    // assignmentExpr: lhs op rhs | conditionalExpr
    if (ctx.op && ASSIGN_OPS.has(ctx.op.text)) {
      const left = this.visitAssignmentLhs(ctx.lhs());
      const right = this.visitAssignmentExpr(ctx.assignmentExpr());
      return {
        kind: "AssignExpr",
        op: ctx.op.text,
        left,
        right,
        span: spanFromCtx(ctx),
      };
    }
    return this.visitConditionalExpr(ctx.conditionalExpr?.() ?? ctx);
  }

  visitAssignmentLhs(ctx: any): Expr {
    // normalmente primary/postfix (ident, member, etc.)
    return this.visitPostfixExpr(ctx.postfixExpr?.() ?? ctx);
  }

  visitConditionalExpr(ctx: any): Expr {
    if (ctx.question) {
      const test = this.visitOrExpr(ctx.orExpr(0));
      const consequent = this.visitExpr(ctx.expr(0));
      const alternate = this.visitExpr(ctx.expr(1));
      return {
        kind: "ConditionalExpr",
        test,
        consequent,
        alternate,
        span: spanFromCtx(ctx),
      };
    }
    return this.visitOrExpr(ctx.orExpr?.() ?? ctx);
  }

  visitOrExpr(ctx: any): Expr {
    return this.foldLeftBin(ctx, "andExpr", "||");
  }
  visitAndExpr(ctx: any): Expr {
    return this.foldLeftBin(ctx, "bitOrExpr", "&&");
  }
  visitBitOrExpr(ctx: any): Expr {
    return this.foldLeftBin(ctx, "bitXorExpr", "|");
  }
  visitBitXorExpr(ctx: any): Expr {
    return this.foldLeftBin(ctx, "bitAndExpr", "^");
  }
  visitBitAndExpr(ctx: any): Expr {
    return this.foldLeftBin(ctx, "equalityExpr", "&");
  }
  visitEqualityExpr(ctx: any): Expr {
    return this.foldChainBin(ctx, ["==", "!="], "relationalExpr");
  }
  visitRelationalExpr(ctx: any): Expr {
    return this.foldChainBin(ctx, ["<", "<=", ">", ">="], "shiftExpr");
  }
  visitShiftExpr(ctx: any): Expr {
    return this.foldChainBin(ctx, ["<<", ">>"], "additiveExpr");
  }
  visitAdditiveExpr(ctx: any): Expr {
    return this.foldChainBin(ctx, ["+", "-"], "multiplicativeExpr");
  }
  visitMultiplicativeExpr(ctx: any): Expr {
    return this.foldChainBin(ctx, ["*", "/", "%"], "unaryExpr");
  }

  visitUnaryExpr(ctx: any): Expr {
    if (ctx.op) {
      const arg = this.visitUnaryExpr(ctx.unaryExpr());
      const opText: string = ctx.op.text;
      if (opText === "++" || opText === "--") {
        return {
          kind: "UpdateExpr",
          op: opText,
          argument: arg,
          prefix: true,
          span: spanFromCtx(ctx),
        };
      }
      return {
        kind: "UnaryExpr",
        op: opText as UnaryExpr["op"],
        argument: arg,
        span: spanFromCtx(ctx),
      };
    }
    return this.visitPostfixExpr(ctx.postfixExpr?.() ?? ctx);
  }

  visitPostfixExpr(ctx: any): Expr {
    // Itera object.member, calls, postfix ++/--
    let expr: Expr = this.visitPrimaryExpr(ctx.primaryExpr?.() ?? ctx);
    for (const tail of ctx.postfixTail?.() ?? []) {
      if (tail.DOT) {
        const prop = id(tail.IDENT().symbol);
        expr = {
          kind: "MemberExpr",
          object: expr,
          property: prop,
          span: spanFromCtx(tail),
        } as MemberExpr;
      } else if (tail.LPAREN) {
        const args = (tail.expr?.() ?? []).map((e: any) => this.visitExpr(e));
        expr = {
          kind: "CallExpr",
          callee: expr,
          args,
          span: spanFromCtx(tail),
        } as CallExpr;
      } else if (tail.op && (tail.op.text === "++" || tail.op.text === "--")) {
        expr = {
          kind: "UpdateExpr",
          op: tail.op.text,
          argument: expr,
          prefix: false,
          span: spanFromCtx(tail),
        };
      }
    }
    return expr;
  }

  visitPrimaryExpr(ctx: any): Expr {
    // literales simples
    if (ctx.literal) return this.visitLiteralExpr(ctx.literal());
    // arrays
    if (ctx.arrayLiteral) return this.visitArrayExpr(ctx.arrayLiteral());
    // objects
    if (ctx.objectLiteral) return this.visitObjectExpr(ctx.objectLiteral());
    // paréntesis
    if (ctx.group) return this.visitExpr(ctx.group().expr());

    // Result/Option/brand
    if (ctx.okCtor)
      return {
        kind: "ResultOkExpr",
        value: this.visitExpr(ctx.okCtor().expr()),
        span: spanFromCtx(ctx),
      } as ResultOkExpr;
    if (ctx.errCtor)
      return {
        kind: "ResultErrExpr",
        error: this.visitExpr(ctx.errCtor().expr()),
        span: spanFromCtx(ctx),
      } as ResultErrExpr;
    if (ctx.someCtor)
      return {
        kind: "OptionSomeExpr",
        value: this.visitExpr(ctx.someCtor().expr()),
        span: spanFromCtx(ctx),
      } as OptionSomeExpr;
    if (ctx.noneCtor)
      return {
        kind: "OptionNoneExpr",
        span: spanFromCtx(ctx),
      } as OptionNoneExpr;

    if (ctx.brandCast) {
      const target = id(ctx.brandCast().IDENT().symbol);
      const value = this.visitExpr(ctx.brandCast().expr());
      return {
        kind: "BrandCastExpr",
        target,
        value,
        span: spanFromCtx(ctx),
      } as BrandCastExpr;
    }

    // match expression
    if (ctx.matchExpr) return this.visitMatchExpr(ctx.matchExpr());

    // identificador / variante-en-patrón
    if (ctx.IDENT) {
      const t = ctx.IDENT().symbol;
      return {
        kind: "IdentifierExpr",
        id: id(t),
        span: spanFromTokens(t, t),
      } as IdentifierExpr;
    }

    throw new Error("Unexpected primary expression");
  }

  visitArrayExpr(ctx: any): ArrayExpr {
    const elements = (ctx.expr?.() ?? []).map((e: any) => this.visitExpr(e));
    return { kind: "ArrayExpr", elements, span: spanFromCtx(ctx) };
  }

  visitObjectExpr(ctx: any): ObjectExpr {
    const s = spanFromCtx(ctx);
    const fields: ObjectField[] = [];
    for (const f of ctx.objectField?.() ?? []) {
      const key = id(f.IDENT().symbol);
      const value = f.expr
        ? this.visitExpr(f.expr())
        : ({
            kind: "IdentifierExpr",
            id: key,
            span: key.span,
          } as IdentifierExpr);
      fields.push({ kind: "ObjectField", key, value, span: s });
    }
    return { kind: "ObjectExpr", fields, span: s };
  }

  visitLiteralExpr(ctx: any): LiteralExpr {
    const lit = this.visitLiteral(ctx.literal?.() ?? ctx);
    return { kind: "LiteralExpr", value: lit, span: lit.span };
  }

  visitLiteral(ctx: any): Literal {
    const s = spanFromCtx(ctx);
    if (ctx.TRUE) return { kind: "Bool", value: true, span: s };
    if (ctx.FALSE) return { kind: "Bool", value: false, span: s };
    if (ctx.NUMBER)
      return { kind: "Number", value: Number(ctx.NUMBER().text), span: s };
    if (ctx.STRING)
      return {
        kind: "String",
        value: this.unquote(ctx.STRING().text),
        span: s,
      };
    throw new Error("Invalid literal");
  }

  // ========== Match ==========
  visitMatchExpr(ctx: any): MatchExpr {
    const s = spanFromCtx(ctx);
    const expr = this.visitExpr(ctx.expr());
    const cases: CaseClause[] = [];
    for (const c of ctx.caseClause?.() ?? []) {
      cases.push(this.visitCaseClause(c));
    }
    return { kind: "MatchExpr", expr, cases, span: s };
  }

  visitCaseClause(ctx: any): CaseClause {
    const s = spanFromCtx(ctx);
    const pattern = this.visitPattern(ctx.pattern());
    const guard = ctx.guard ? this.visitExpr(ctx.guard().expr()) : undefined;
    let body: Block | Expr;
    if (ctx.block) body = this.visitBlock(ctx.block());
    else body = this.visitExpr(ctx.expr());
    return { kind: "CaseClause", pattern, guard, body, span: s };
  }

  visitPattern(ctx: any): Pattern {
    const s = spanFromCtx(ctx);
    if (ctx.literal) {
      const lit = this.visitLiteral(ctx.literal());
      return { kind: "LiteralPattern", value: lit, span: s } as LiteralPattern;
    }
    const name = id(ctx.IDENT().symbol);
    let fields: PatternField[] | undefined;
    if (ctx.patternFieldList) {
      fields = (ctx.patternFieldList().patternField?.() ?? []).map(
        (pf: any) => {
          const fname = id(pf.IDENT(0).symbol);
          const alias = pf.IDENT(1) ? id(pf.IDENT(1).symbol) : undefined;
          return {
            kind: "PatternField",
            name: fname,
            alias,
            span: s,
          } as PatternField;
        },
      );
    }
    const vp: VariantPattern = {
      kind: "VariantPattern",
      head: { tag: "Named", name },
      fields,
      span: s,
    };
    return vp;
  }

  // ========== Folds binarios utilitarios ==========
  private foldLeftBin(
    ctx: any,
    childName: string,
    opText: BinaryExpr["op"],
  ): Expr {
    const parts = ctx[childName]?.() ?? [];
    if (parts.length === 0) return this.visitChildren(ctx);
    let left = this.visit(parts[0]);
    for (let i = 1; i < parts.length; i++) {
      const right = this.visit(parts[i]);
      left = {
        kind: "BinaryExpr",
        op: opText,
        left,
        right,
        span: spanFromCtx(ctx),
      } as BinaryExpr;
    }
    return left;
    // Nota: si tu regla expone una lista de operadores reales, cambia a foldChainBin.
  }

  private foldChainBin(ctx: any, opsAllowed: string[], nextName: string): Expr {
    // Espera algo tipo: next (op next)*
    const nodes = ctx[nextName]?.() ?? [];
    if (nodes.length === 0) return this.visitChildren(ctx);
    let left = this.visit(nodes[0]);
    // Intenta leer los tokens intermedios si los expone la regla
    const ops: TerminalNode[] = ctx.OP?.() ?? ctx.op?.() ?? [];
    for (let i = 1; i < nodes.length; i++) {
      const opText = ops[i - 1]?.text ?? "";
      const norm = opsAllowed.includes(opText) ? opText : opText;
      left = {
        kind: "BinaryExpr",
        op: BIN_OPS[norm] ?? (norm as any),
        left,
        right: this.visit(nodes[i]),
        span: spanFromCtx(ctx),
      } as BinaryExpr;
    }
    return left;
  }

  // ========== Utilidades varias ==========
  private unquote(s: string): string {
    if (!s) return s;
    if (s.startsWith('"') || s.startsWith("'")) return s.slice(1, -1);
    return s;
  }

  private extractStringLiteral(strNode?: TerminalNode): string {
    const raw = strNode?.text ?? '""';
    return this.unquote(raw);
  }

  private extractStringArray(tagsListCtx: any): string[] | undefined {
    if (!tagsListCtx) return undefined;
    const arr: string[] = [];
    for (const s of tagsListCtx.STRING?.() ?? []) {
      arr.push(this.unquote(s.text));
    }
    return arr;
  }

  private extractRefinement(refCtx: any): string | undefined {
    if (!refCtx) return undefined;
    // si tu gramática ya captura como texto, puedes usar refCtx.getText()
    // o reconstruir tokens concretos; aquí devolvemos el texto crudo sin espacios extras
    return refCtx.getText?.() ?? undefined;
  }
}
