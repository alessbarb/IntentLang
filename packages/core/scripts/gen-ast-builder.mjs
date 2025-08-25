#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

// === Config mínima ===
const ROOT = path.resolve(process.cwd()); // packages/core
const SRC_DIR = path.join(ROOT, "src");
const GENERATED_DIR = path.join(SRC_DIR, "_generated");
const GRAMMAR_DIR = path.join(GENERATED_DIR, "grammar");
const OUT_FILE = path.join(GENERATED_DIR, "ast.builder.ts");
const PARSER_TS = path.join(GRAMMAR_DIR, "IntentLangParser.ts");

// Utilidad: detectar si una cadena existe en el parser TS generado
function parserHas(pattern) {
  try {
    const txt = fs.readFileSync(PARSER_TS, "utf8");
    if (pattern instanceof RegExp) return pattern.test(txt);
    return txt.includes(pattern);
  } catch (e) {
    return false;
  }
}

// Señales para adaptar el builder a la gramática real
const HAS_UPDATE_STMT = parserHas(/class\s+UpdateStmtContext\b/);
const HAS_POSTFIX_PLUSPLUS = parserHas(/\bPLUSPLUS\b/);
const HAS_POSTFIX_MINUSMINUS = parserHas(/\bMINUSMINUS\b/);

// Emit del archivo (plantilla con ramas según detección)
const header = `/* AUTO-GENERATED: DO NOT EDIT.
 * Builds IntentLang AST from ANTLR parse trees.
 * Source: generated parser (IntentLangParser.ts)
 */
import type {
  Program, IntentSection, UsesSection, UseDecl, TypesSection, TypeDecl,
  Identifier, Literal, TypeExpr, FuncDecl, EffectDecl, TestDecl,
  Block, Stmt, Expr,
  ObjectField, MapEntry, CaseClause, LambdaParam
} from "../ast.js";
import { spanFromCtx, spanFromTokens } from "../pos.js";

import { ParserRuleContext, AbstractParseTreeVisitor } from "antlr4ng";
import type { ParseTree, TerminalNode } from "antlr4ng";

import type { IntentLangParserVisitor } from "./grammar/IntentLangParserVisitor.js";
import {
  FileContext,
  TopLevelDeclContext,
  IntentSectionContext,
  UsesSectionContext,
  TypesSectionContext,
  TypeDeclContext,
  TypeExprContext, NonUnionTypeContext, UnionTypeContext, UnionCtorContext,
  RecordTypeContext, FieldListContext, FieldDeclContext,
  RefinementExprContext, LiteralTypeContext,
  GenericTypeContext, BrandableTypeContext, BasicTypeContext,
  FuncTypeContext, ParamTypeListContext, ParamTypeContext, ArrayTypeContext, MapTypeContext,
  TopLevelConstDeclContext, FuncDeclContext, EffectDeclContext, TestDeclContext,
  ParamListContext, ParamContext, ContractBlockContext,
  BlockContext, StmtContext,
  LetStmtContext, ConstStmtContext, AssignStmtContext, ${HAS_UPDATE_STMT ? "UpdateStmtContext, " : ""} LValueContext,
  ReturnStmtContext, IfStmtContext, MatchStmtContext, ForStmtContext, WhileStmtContext,
  BreakStmtContext, ContinueStmtContext, TryStmtContext, ExprStmtContext,
  ExprContext, CondExprContext, OrExprContext, AndExprContext, BitOrExprContext, BitXorExprContext, BitAndExprContext,
  EqualityExprContext, RelExprContext, ShiftExprContext, AddExprContext, MulExprContext,
  UnaryExprContext, PostfixExprContext, ArgListContext,
  PrimaryContext, LambdaExprContext, TypedParamListContext, TypedParamContext,
  ObjectExprContext, VariantExprContext, ArrayExprContext, MapExprContext, MapEntryContext as MapEntryRt,
  MatchExprContext, RecordFieldListContext, RecordFieldContext, ResultOkExprContext, ResultErrExprContext,
  OptionSomeExprContext, OptionNoneExprContext, BrandCastExprContext, CaseClauseContext, LiteralContext,
  PatternContext, WildcardPatternContext, LiteralPatternContext, VariantPatternContext,
  PatternArgListContext, RecordPatternContext, PatternFieldListContext, PatternFieldContext, IdentPatternContext,
  IdentContext as IdentRule, StringContext as StringRule, IntContext as IntRule, FloatContext as FloatRule, BoolContext as BoolRule,
} from "./grammar/IntentLangParser.js";

/** Helpers */
function isTerminal(n: ParseTree): n is TerminalNode {
  return !!n && typeof (n as any).getText === "function" && "symbol" in (n as any);
}
function spanOf(n: ParserRuleContext | TerminalNode) {
  return isTerminal(n) ? spanFromTokens((n as TerminalNode).symbol, (n as TerminalNode).symbol)
                       : spanFromCtx(n as ParserRuleContext);
}
function id(ctx: ParserRuleContext | TerminalNode | undefined): Identifier {
  if (!ctx) return { kind: "Identifier", name: "", span: { start: 0, end: 0 } as any };
  return { kind: "Identifier", name: (ctx as any).getText(), span: spanOf(ctx as any) };
}
function mkIdent(name: string, span: any): Identifier {
  return { kind: "Identifier", name, span };
}
function litString(ctx: ParserRuleContext) {
  const raw = ctx.getText();
  const span = spanFromCtx(ctx);

  const CH = (n: number) => String.fromCharCode(n);
  const BS = CH(92);
  const DQ = CH(34);
  const SQ = CH(39);
  const NL = CH(10);
  const CR = CH(13);
  const TB = CH(9);
  const BK = CH(8);
  const FF = CH(12);
  const VT = CH(11);
  const N0 = CH(0);

  const q0 = raw.charCodeAt(0);
  const q1 = raw.charCodeAt(raw.length - 1);
  const quoted = (q0 === 34 || q0 === 39) && q1 === q0;
  const s = quoted ? raw.slice(1, -1) : raw;

  let out = "";
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code !== 92) { out += s[i]; continue; }

    i++;
    if (i >= s.length) { out += BS; break; }
    const esc = s.charCodeAt(i);

    switch (esc) {
      case 110: out += NL; break;
      case 114: out += CR; break;
      case 116: out += TB; break;
      case 98:  out += BK; break;
      case 102: out += FF; break;
      case 118: out += VT; break;
      case 48:  out += N0; break;
      case 34:  out += DQ; break;
      case 39:  out += SQ; break;
      case 92:  out += BS; break;
      case 117: {
        const hex = s.slice(i + 1, i + 5);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          const hi = parseInt(hex, 16);
          i += 4;

          if (hi >= 0xD800 && hi <= 0xDBFF && i + 2 < s.length && s.charCodeAt(i + 1) === 92 && s.charCodeAt(i + 2) === 117) {
            const hex2 = s.slice(i + 3, i + 7);
            if (/^[0-9a-fA-F]{4}$/.test(hex2)) {
              const lo = parseInt(hex2, 16);
              const cp = ((hi - 0xD800) << 10) + (lo - 0xDC00) + 0x10000;
              out += String.fromCodePoint(cp);
              i += 6;
              break;
            }
          }
          out += CH(hi);
        } else {
          out += BS + "u";
        }
        break;
      }
      case 120: {
        const hex = s.slice(i + 1, i + 3);
        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
          out += CH(parseInt(hex, 16));
          i += 2;
        } else {
          out += BS + "x";
        }
        break;
      }
      default:
        out += BS + String.fromCharCode(esc);
    }
  }

  return { kind: "String", value: out, span };
}
function litInt(ctx: ParserRuleContext)   { return { kind: "Number", value: Number(ctx.getText()), span: spanFromCtx(ctx) }; }
function litFloat(ctx: ParserRuleContext) { return { kind: "Number", value: Number(ctx.getText()), span: spanFromCtx(ctx) }; }
function litBool(ctx: ParserRuleContext)  { return { kind: "Bool",   value: ctx.getText() === "true", span: spanFromCtx(ctx) }; }

function foldBinary(ctx: ParserRuleContext, opSet: Set<string>, visitLeaf: (c: ParseTree) => any) {
  const ch = (ctx.children ?? []).filter((c: any) => !isTerminal(c) || opSet.has(c.getText()));
  if (ch.length === 0) return { kind: "LiteralExpr", value: { kind: "Bool", value: true, span: spanFromCtx(ctx) }, span: spanFromCtx(ctx) };
  let cur: any = null; let i = 0;
  while (i < ch.length) {
    const n = ch[i++];
    if (isTerminal(n)) continue;
    const leaf = visitLeaf(n);
    if (cur == null) cur = leaf; else {
      const opTok = ch[i-2];
      const opTxt = opTok.getText();
      cur = { kind: "BinaryExpr", op: opTxt, left: cur, right: leaf, span: spanFromCtx(ctx) };
    }
  }
  return cur;
}
`;

const visitFileSection = `
export class AstBuilder extends AbstractParseTreeVisitor<any> implements IntentLangParserVisitor<any> {
  protected defaultResult() { return null; }

  // Wrapper: visita si hay nodo; si no, devuelve undefined (tipado como any)
  private V<T = any>(node?: ParseTree | null): T {
    return (node ? (this.visit(node) as T) : (undefined as unknown as T));
  }

  /* ========== Archivo raíz ========== */
  visitFile(ctx: FileContext) {
    const span = spanFromCtx(ctx);
    let intent; let uses; let types;
    const items: any[] = [];
    for (const c of (ctx.children ?? []) as ParseTree[]) {
      if (!isTerminal(c) && c instanceof IntentSectionContext) intent = this.visitIntentSection(c);
      else if (!isTerminal(c) && c instanceof UsesSectionContext) uses = this.visitUsesSection(c);
      else if (!isTerminal(c) && c instanceof TypesSectionContext) types = this.visitTypesSection(c);
      else if (!isTerminal(c) && c instanceof TopLevelDeclContext) {
        const it = this.visitTopLevelDecl(c); if (it) items.push(it);
      }
    }
    return { kind: "Program", span, intent, uses, types, items };
  }

  visitTopLevelDecl(ctx: TopLevelDeclContext) {
    const kids = (ctx.children ?? []) as ParseTree[];
    for (const k of kids) {
      if (isTerminal(k)) continue;
      if (k instanceof FuncDeclContext) return this.visitFuncDecl(k);
      if (k instanceof EffectDeclContext) return this.visitEffectDecl(k);
      if (k instanceof TestDeclContext) return this.visitTestDecl(k);
      if (k instanceof TypesSectionContext) return this.visitTypesSection(k);
      if (k instanceof UsesSectionContext) return this.visitUsesSection(k);
      if (k instanceof IntentSectionContext) return this.visitIntentSection(k);
    }
    return null;
  }
`;

const visitSections = `
  /* ========== Secciones ========== */
  visitIntentSection(ctx: IntentSectionContext) {
    const span = spanFromCtx(ctx);
    let description = ""; const tags: string[] = [];
    let stringCount = 0;
    for (const c of (ctx.children ?? []) as ParseTree[]) {
      if (!isTerminal(c) && c instanceof StringRule) {
        const val = this.V<Literal>(c) as any;
        if (stringCount === 0) description = val.value; else tags.push(val.value);
        stringCount++;
      }
    }
    return { kind: "IntentSection", description, tags: tags.length ? tags : undefined, span };
  }

  visitUsesSection(ctx: UsesSectionContext) {
    const span = spanFromCtx(ctx); const entries: any[] = [];
    for (const c of (ctx.children ?? []) as ParseTree[]) {
      if (c instanceof ParserRuleContext && (c as any).ruleIndex === (ctx as any).parser.ruleNames.indexOf("useDecl")) {
        entries.push(this.V(c));
      }
    }
    return { kind: "UsesSection", entries, span };
  }

  visitTypesSection(ctx: TypesSectionContext) {
    const span = spanFromCtx(ctx); const declarations: any[] = [];
    for (const c of (ctx.children ?? []) as ParseTree[]) if (c instanceof TypeDeclContext) declarations.push(this.visitTypeDecl(c));
    return { kind: "TypesSection", declarations, span };
  }
`;

const visitTypes = `
  /* ========== Tipos ========== */
  visitTypeDecl(ctx: TypeDeclContext) {
    const span = spanFromCtx(ctx);
    const ids = ((ctx.children ?? []) as ParseTree[]).filter(c => c instanceof IdentRule) as IdentRule[];
    const name = id(ids[0]);
    const expr = this.V<TypeExpr>((((ctx.children ?? []) as ParseTree[]).find(c => c instanceof TypeExprContext)));
    let refinement: string | undefined;
    const where = ((ctx.children ?? []) as ParseTree[]).find(c => isTerminal(c) && c.getText() === "where");
    if (where) {
      const ref = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof RefinementExprContext) as ParserRuleContext | undefined;
      if (ref) refinement = ref.getText();
    }
    return { kind: "TypeDecl", name, expr, refinement, span };
  }

  visitTypeExpr(ctx: TypeExprContext) {
    for (const c of (ctx.children ?? []) as ParseTree[]) {
      if (!isTerminal(c) && c instanceof UnionTypeContext) return this.visitUnionType(c);
      if (!isTerminal(c) && c instanceof NonUnionTypeContext) {
        const base = this.V<TypeExpr>(((c.children ?? []) as ParseTree[]).find(x => x instanceof BrandableTypeContext));
        const brandTok = ((c.children ?? []) as ParseTree[]).find(x => isTerminal(x) && x.getText() === "brand");
        if (brandTok) {
          const s = ((c.children ?? []) as ParseTree[]).find(x => x instanceof StringRule) as StringRule | undefined;
          return { kind: "BrandType", base, brand: s ? (this.V<Literal>(s) as any).value : "", span: spanFromCtx(ctx) };
        }
        return base;
      }
    }
    throw new Error("TypeExpr: unreachable");
  }

  visitUnionType(ctx: UnionTypeContext) {
    const span = spanFromCtx(ctx); const ctors: any[] = [];
    for (const ch of (ctx.children ?? []) as ParseTree[]) {
      if (!isTerminal(ch) && ch instanceof UnionCtorContext) {
        const idn = ((ch.children ?? []) as ParseTree[]).find(x => x instanceof IdentRule) as IdentRule | undefined;
        if (idn) {
          const rec = ((ch.children ?? []) as ParseTree[]).find(x => x instanceof RecordTypeContext) as RecordTypeContext | undefined;
          ctors.push({ kind: "NamedCtor", name: id(idn), fields: rec ? this.visitRecordType(rec) : undefined, span });
        } else {
          const litT = ((ch.children ?? []) as ParseTree[]).find(x => x instanceof LiteralTypeContext) as LiteralTypeContext | undefined;
          if (litT) ctors.push({ kind: "LiteralCtor", literal: this.visitLiteralType(litT), span });
        }
      }
    }
    return { kind: "UnionType", ctors, span };
  }

  visitRecordType(ctx: RecordTypeContext) {
    const span = spanFromCtx(ctx); const fields: any[] = [];
    const list = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof FieldListContext) as FieldListContext | undefined;
    if (list) for (const f of (list.children ?? []) as ParseTree[]) if (f instanceof FieldDeclContext) {
      const nm = id(((f.children ?? []) as ParseTree[]).find(x => x instanceof IdentRule) as IdentRule | undefined);
      const ty = this.V<TypeExpr>(((f.children ?? []) as ParseTree[]).find(x => x instanceof TypeExprContext));
      let refinement: string | undefined;
      const where = ((f.children ?? []) as ParseTree[]).find(x => isTerminal(x) && x.getText() === "where");
      if (where) {
        const ref = ((f.children ?? []) as ParseTree[]).find(x => x instanceof RefinementExprContext) as ParserRuleContext | undefined;
        refinement = ref?.getText();
      }
      fields.push({ kind: "RecordField", name: nm, type: ty, refinement, span: spanFromCtx(f) });
    }
    return { kind: "RecordType", fields, span };
  }

  visitLiteralType(ctx: LiteralTypeContext) {
    const s = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof StringRule) as StringRule | undefined;
    return { kind: "LiteralType", value: (this.V<Literal>(s) as any).value, span: spanFromCtx(ctx) };
  }
  visitBasicType(ctx: BasicTypeContext) { return { kind: "BasicType", name: ctx.getText(), span: spanFromCtx(ctx) }; }
  visitArrayType(ctx: ArrayTypeContext) { return { kind: "ArrayType", element: this.V<TypeExpr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof TypeExprContext)), span: spanFromCtx(ctx) }; }
  visitMapType(ctx: MapTypeContext) {
    const parts = ((ctx.children ?? []) as ParseTree[]).filter((c): c is TypeExprContext => c instanceof TypeExprContext);
    return { kind: "MapType", key: this.V<TypeExpr>(parts[0]), value: this.V<TypeExpr>(parts[1]), span: spanFromCtx(ctx) };
  }
  visitGenericType(ctx: GenericTypeContext) {
    const span = spanFromCtx(ctx);
    const name = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
    const params = ((ctx.children ?? []) as ParseTree[]).filter((c): c is TypeExprContext => c instanceof TypeExprContext).map(c => this.V<TypeExpr>(c));
    return { kind: "GenericType", name, params, span };
  }
  visitFuncType(ctx: FuncTypeContext) {
    const span = spanFromCtx(ctx); const params: any[] = [];
    const list = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ParamTypeListContext) as ParamTypeListContext | undefined;
    if (list) for (const p of (list.children ?? []) as ParseTree[]) if (p instanceof ParamTypeContext) {
      const nameRule = ((p.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined;
      const typeRule = ((p.children ?? []) as ParseTree[]).find(c => c instanceof TypeExprContext);
      params.push({ name: nameRule ? id(nameRule) : undefined, type: this.V<TypeExpr>(typeRule) });
    }
    const ret = this.V<TypeExpr>(((ctx.children ?? []) as ParseTree[]).slice().reverse().find(c => c instanceof TypeExprContext));
    return { kind: "FuncType", params, returnType: ret, span };
  }
`;

const visitDecls = `
  /* ========== Decls ========== */
  visitParam(ctx: ParserRuleContext) {
    const name = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
    const type = this.V<TypeExpr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof TypeExprContext));
    return { kind: "ParamSig", name, type, span: spanFromCtx(ctx) };
  }
  visitParamList(ctx: ParamListContext) {
    const out: any[] = [];
    for (const c of (ctx.children ?? []) as ParseTree[]) if (c instanceof ParamContext) out.push(this.visitParam(c));
    return out;
  }
  visitContractBlock(ctx: ContractBlockContext) {
    const parts = ((ctx.children ?? []) as ParseTree[]).filter((c): c is ExprContext => c instanceof ExprContext);
    if (ctx.getText().startsWith("requires")) {
      return parts.length === 2 ? { requires: this.V(parts[0]), ensures: this.V(parts[1]) }
                                : { requires: this.V(parts[0]) };
    } else {
      return { ensures: this.V(parts[0]) };
    }
  }
  visitFuncDecl(ctx: FuncDeclContext) {
    const span = spanFromCtx(ctx);
    const name = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
    const params = this.V<any[]>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ParamListContext)) ?? [];
    const returnType = this.V<TypeExpr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof TypeExprContext));
    const contract = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ContractBlockContext) as ContractBlockContext | undefined;
    const body = this.V<Block>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof BlockContext));
    return { kind: "FuncDecl", name, params, returnType, contracts: contract ? this.visitContractBlock(contract) : undefined, body, span };
  }
  visitEffectDecl(ctx: EffectDeclContext) {
    const span = spanFromCtx(ctx);
    const name = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
    const params = this.V<any[]>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ParamListContext)) ?? [];
    const returnType = this.V<TypeExpr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof TypeExprContext));
    const contract = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ContractBlockContext) as ContractBlockContext | undefined;
    const usesIds: Identifier[] = [];
    for (const c of (ctx.children ?? []) as ParseTree[]) if (c instanceof IdentRule) usesIds.push(id(c));
    const uses = usesIds.slice(1);
    const body = this.V<Block>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof BlockContext));
    return { kind: "EffectDecl", name, params, returnType, contracts: contract ? this.visitContractBlock(contract) : undefined, uses, body, span };
  }
  visitTestDecl(ctx: TestDeclContext) {
    const span = spanFromCtx(ctx);
    const name = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
    const body = this.V<Block>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof BlockContext));
    return { kind: "TestDecl", name, body, span };
  }
`;

const visitBlocksStmts = `
  /* ========== Blocks & Stmts ========== */
  visitBlock(ctx: BlockContext) {
    const span = spanFromCtx(ctx); const statements: any[] = [];
    for (const s of (ctx.children ?? []) as ParseTree[]) if (s instanceof StmtContext) {
      const node = this.visitStmt(s); if (node) statements.push(node);
    }
    return { kind: "Block", statements, span };
  }
  visitStmt(ctx: StmtContext) {
    for (const c of (ctx.children ?? []) as ParseTree[]) {
      if (isTerminal(c)) continue;
      if (c instanceof LetStmtContext) return this.visitLetStmt(c);
      if (c instanceof ConstStmtContext) return this.visitConstStmt(c);
      if (c instanceof AssignStmtContext) return this.visitAssignStmt(c);
      ${HAS_UPDATE_STMT ? "if (c instanceof UpdateStmtContext) return this.visitUpdateStmt(c);" : ""}
      if (c instanceof ReturnStmtContext) return this.visitReturnStmt(c);
      if (c instanceof IfStmtContext) return this.visitIfStmt(c);
      if (c instanceof MatchStmtContext) return this.visitMatchStmt(c);
      if (c instanceof ForStmtContext) return this.visitForStmt(c);
      if (c instanceof WhileStmtContext) return this.visitWhileStmt(c);
      if (c instanceof BreakStmtContext) return ({ kind: "BreakStmt", span: spanFromCtx(c) });
      if (c instanceof ContinueStmtContext) return ({ kind: "ContinueStmt", span: spanFromCtx(c) });
      if (c instanceof TryStmtContext) return this.visitTryStmt(c);
      if (c instanceof ExprStmtContext) return this.visitExprStmt(c);
    }
    return null;
  }
  visitLetStmt(ctx: LetStmtContext) {
    const span = spanFromCtx(ctx);
    const nm = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
    const init = this.V<Expr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ExprContext));
    return { kind: "LetStmt", id: nm, init, span };
  }
  visitConstStmt(ctx: ConstStmtContext) {
    const span = spanFromCtx(ctx);
    const nm = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
    const init = this.V<Expr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ExprContext));
    return { kind: "ConstStmt", id: nm, init, span };
  }
  visitAssignStmt(ctx: AssignStmtContext) {
    const span = spanFromCtx(ctx);
    const target = this.V(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof LValueContext));
    const value = this.V(((ctx.children ?? []) as ParseTree[]).slice().reverse().find(c => c instanceof ExprContext));
    const opTok = ((ctx.children ?? []) as ParseTree[]).find(c => isTerminal(c) && ["=","+=","-=","*=","/=","%="].includes(c.getText())) as TerminalNode;
    return { kind: "AssignStmt", op: opTok.getText(), target, value, span };
  }
  ${
    HAS_UPDATE_STMT
      ? `
  visitUpdateStmt(ctx: UpdateStmtContext) {
    const span = spanFromCtx(ctx);
    const target = this.V(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof LValueContext));
    const opTok = ((ctx.children ?? []) as ParseTree[]).find(c => isTerminal(c) && (c.getText() === "++" || c.getText() === "--")) as TerminalNode | undefined;
    return { kind: "UpdateStmt", op: opTok?.getText() ?? "++", target, span };
  }`
      : ""
  }

  visitExprStmt(ctx: ExprStmtContext) { const e = this.V<Expr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ExprContext)); return { kind: "ExprStmt", expression: e, span: spanFromCtx(ctx) }; }
  visitReturnStmt(ctx: ReturnStmtContext) { const e = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ExprContext); return { kind: "ReturnStmt", argument: e ? this.V<Expr>(e) : undefined, span: spanFromCtx(ctx) }; }
  visitIfStmt(ctx: IfStmtContext) {
    const span = spanFromCtx(ctx);
    const parts = ((ctx.children ?? []) as ParseTree[]).filter((c): c is ParserRuleContext => c instanceof ParserRuleContext);
    const test = this.V<Expr>(parts.find(p => p instanceof ExprContext));
    const blocks = parts.filter((p): p is BlockContext => p instanceof BlockContext);
    return { kind: "IfStmt", test, consequent: this.visitBlock(blocks[0]), alternate: blocks[1] ? this.visitBlock(blocks[1]) : undefined, span };
  }
  visitForStmt(ctx: ForStmtContext) { const span = spanFromCtx(ctx); const it = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined); const iterable = this.V<Expr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ExprContext)); const body = this.visitBlock(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof BlockContext) as BlockContext); return { kind: "ForStmt", iterator: it, iterable, body, span }; }
  visitWhileStmt(ctx: WhileStmtContext) { const span = spanFromCtx(ctx); const test = this.V<Expr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ExprContext)); const body = this.visitBlock(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof BlockContext) as BlockContext); return { kind: "WhileStmt", test, body, span }; }
  visitTryStmt(ctx: TryStmtContext) { const span = spanFromCtx(ctx); const blocks = ((ctx.children ?? []) as ParseTree[]).filter((c): c is BlockContext => c instanceof BlockContext); const catchId = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined); return { kind: "TryStmt", tryBlock: this.visitBlock(blocks[0]), catchParam: catchId, catchBlock: this.visitBlock(blocks[1]), span }; }
  visitLValue(ctx: LValueContext) {
    const span = spanFromCtx(ctx);
    const base = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
    const path: any[] = []; const ch = (ctx.children ?? []) as ParseTree[];
    for (let i = 0; i < ch.length; i++) {
      const n = ch[i];
      if (isTerminal(n) && n.getText() === ".") { const nm = ch[i+1] as TerminalNode; path.push({ kind: "LvProp", name: id(nm), span: spanOf(nm) }); }
      if (isTerminal(n) && n.getText() === "[") { const ex = ch[i+1] as ExprContext; path.push({ kind: "LvIndex", index: this.V<Expr>(ex), span: spanFromCtx(ex) }); }
    }
    return { kind: "LValue", base, path, span };
  }

  // Si tu AST no tiene MatchStmt, lo bajamos a ExprStmt con MatchExpr:
  visitMatchStmt(ctx: MatchStmtContext) {
    const me = this.visitMatchExpr(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof MatchExprContext) as MatchExprContext);
    return { kind: "ExprStmt", expression: me, span: spanFromCtx(ctx) };
  }
`;

const visitExprs = `
  /* ========== Expresiones ========== */
  visitExpr(ctx: ExprContext) { return this.V(((ctx.children ?? []) as ParseTree[])[0]); }
  visitCondExpr(ctx: CondExprContext) {
    const parts = ((ctx.children ?? []) as ParseTree[]).filter((c): c is ParserRuleContext => c instanceof ParserRuleContext);
    if (parts.length === 1) return this.V(parts[0]);
    return { kind: "ConditionalExpr", test: this.V(parts[0]), consequent: this.V(parts[1]), alternate: this.V(parts[2]), span: spanFromCtx(ctx) };
  }
  visitOrExpr(ctx: OrExprContext)       { return foldBinary(ctx, new Set(["||"]), (c) => this.V(c)); }
  visitAndExpr(ctx: AndExprContext)     { return foldBinary(ctx, new Set(["&&"]), (c) => this.V(c)); }
  visitBitOrExpr(ctx: BitOrExprContext) { return foldBinary(ctx, new Set(["|"]),  (c) => this.V(c)); }
  visitBitXorExpr(ctx: BitXorExprContext){ return foldBinary(ctx, new Set(["^"]), (c) => this.V(c)); }
  visitBitAndExpr(ctx: BitAndExprContext){ return foldBinary(ctx, new Set(["&"]), (c) => this.V(c)); }
  visitEqualityExpr(ctx: EqualityExprContext){ return foldBinary(ctx, new Set(["==","!="]), (c) => this.V(c)); }
  visitRelExpr(ctx: RelExprContext)     { return foldBinary(ctx, new Set(["<","<=",">",">="]), (c) => this.V(c)); }
  visitShiftExpr(ctx: ShiftExprContext) { return foldBinary(ctx, new Set(["<<",">>"]), (c) => this.V(c)); }
  visitAddExpr(ctx: AddExprContext)     { return foldBinary(ctx, new Set(["+","-"]), (c) => this.V(c)); }
  visitMulExpr(ctx: MulExprContext)     { return foldBinary(ctx, new Set(["*","/","%"]), (c) => this.V(c)); }

  visitUnaryExpr(ctx: UnaryExprContext) {
    const ch = (ctx.children ?? []) as ParseTree[];
    if (ch.length >= 2 && ch[0] && isTerminal(ch[0])) {
      const op = ch[0].getText();
      const arg = this.V(ch.find(c => c instanceof UnaryExprContext || c instanceof PostfixExprContext));
      return { kind: "UnaryExpr", op, argument: arg, span: spanFromCtx(ctx) };
    }
    return this.V(ch.find(c => c instanceof PostfixExprContext));
  }

  visitPostfixExpr(ctx: PostfixExprContext) {
    let cur = this.V(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof PrimaryContext));
    const ch = (ctx.children ?? []) as ParseTree[];
    for (let i = 0; i < ch.length; i++) {
      const n = ch[i];
      if (isTerminal(n) && n.getText() === "(") {
        const argsRule = ch[i+1] as ArgListContext | undefined;
        const args = argsRule ? ((argsRule.children ?? []) as ParseTree[]).filter((x): x is ExprContext => x instanceof ExprContext).map(x => this.V<Expr>(x)) : [];
        cur = { kind: "CallExpr", callee: cur, args, span: spanFromCtx(argsRule ?? ctx) };
      } else if (isTerminal(n) && n.getText() === ".") {
        const nm = ch[i+1] as TerminalNode;
        cur = { kind: "MemberExpr", object: cur, property: id(nm), span: spanOf(nm) };
      } else if (isTerminal(n) && n.getText() === "[") {
        const ix = ch[i+1] as ExprContext;
        cur = { kind: "IndexExpr", object: cur, index: this.V<Expr>(ix), span: spanFromCtx(ix) };
      } ${
        HAS_POSTFIX_PLUSPLUS || HAS_POSTFIX_MINUSMINUS
          ? `
        else if (isTerminal(n) && (n.getText() === "++" || n.getText() === "--")) {
        cur = { kind: "PostfixUpdateExpr", op: n.getText(), argument: cur, span: spanOf(n) };
      }`
          : ""
      }
    }
    return cur;
  }

  visitPrimary(ctx: PrimaryContext) {
    for (const c of (ctx.children ?? []) as ParseTree[]) {
      if (!isTerminal(c)) {
        if (c instanceof LiteralContext) return { kind: "LiteralExpr", value: this.visitLiteral(c), span: spanFromCtx(c) };
        if (c instanceof IdentRule)       return { kind: "IdentifierExpr", id: id(c), span: spanFromCtx(c) };
        if (c instanceof ObjectExprContext)  return this.visitObjectExpr(c);
        if (c instanceof VariantExprContext) return this.visitVariantExpr(c);
        if (c instanceof ArrayExprContext)   return this.visitArrayExpr(c);
        if (c instanceof MapExprContext)     return this.visitMapExpr(c);
        if (c instanceof MatchExprContext)   return this.visitMatchExpr(c);
        if (c instanceof ResultOkExprContext)  return { kind: "ResultOkExpr", value: this.V<Expr>(((c.children ?? []) as ParseTree[]).find(x => x instanceof ExprContext)), span: spanFromCtx(c) };
        if (c instanceof ResultErrExprContext) return { kind: "ResultErrExpr", error: this.V<Expr>(((c.children ?? []) as ParseTree[]).find(x => x instanceof ExprContext)), span: spanFromCtx(c) };
        if (c instanceof OptionSomeExprContext) return { kind: "OptionSomeExpr", value: this.V<Expr>(((c.children ?? []) as ParseTree[]).find(x => x instanceof ExprContext)), span: spanFromCtx(c) };
        if (c instanceof OptionNoneExprContext) return { kind: "OptionNoneExpr", span: spanFromCtx(c) };
        if (c instanceof BrandCastExprContext) {
          const tgt = id(((c.children ?? []) as ParseTree[]).find(x => x instanceof IdentRule) as IdentRule | undefined);
          const val = this.V<Expr>(((c.children ?? []) as ParseTree[]).find(x => x instanceof ExprContext));
          return { kind: "BrandCastExpr", target: tgt, value: val, span: spanFromCtx(c) };
        }
        if (c instanceof LambdaExprContext)  return this.visitLambdaExpr(c);
        if (c instanceof ExprContext)        return this.V(c);
      }
    }
    return { kind: "LiteralExpr", value: { kind: "Bool", value: true, span: spanFromCtx(ctx) }, span: spanFromCtx(ctx) };
  }

  visitLiteral(ctx: LiteralContext) {
    for (const c of (ctx.children ?? []) as ParseTree[]) {
      if (!isTerminal(c)) {
        if (c instanceof StringRule) return litString(c);
        if (c instanceof FloatRule)  return litFloat(c);
        if (c instanceof IntRule)    return litInt(c);
        if (c instanceof BoolRule)   return litBool(c);
      }
    }
    return { kind: "Bool", value: true, span: spanFromCtx(ctx) };
  }

  visitObjectExpr(ctx: ObjectExprContext) {
    const span = spanFromCtx(ctx); const fields: any[] = [];
    const list = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof RecordFieldListContext) as RecordFieldListContext | undefined;
    if (list) for (const f of (list.children ?? []) as ParseTree[]) if (f instanceof RecordFieldContext) {
      const key = id(((f.children ?? []) as ParseTree[]).find(x => x instanceof IdentRule) as IdentRule | undefined);
      const val = ((f.children ?? []) as ParseTree[]).find(x => x instanceof ExprContext);
      fields.push({ kind: "ObjectField", key, value: val ? this.V<Expr>(val) : undefined, span: spanFromCtx(f) });
    }
    return { kind: "ObjectExpr", fields, span };
  }
  visitVariantExpr(ctx: VariantExprContext) {
    const span = spanFromCtx(ctx); const ctor = id(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
    const rec = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof RecordFieldListContext) as RecordFieldListContext | undefined;
    if (rec) {
      const fields: any[] = [];
      for (const f of (rec.children ?? []) as ParseTree[]) if (f instanceof RecordFieldContext) {
        const key = id(((f.children ?? []) as ParseTree[]).find(x => x instanceof IdentRule) as IdentRule | undefined);
        const val = ((f.children ?? []) as ParseTree[]).find(x => x instanceof ExprContext);
        fields.push({ kind: "VariantFieldInit", key, value: val ? this.V<Expr>(val) : { kind: "LiteralExpr", value: { kind: "Bool", value: true, span: spanFromCtx(f) }, span: spanFromCtx(f) }, span: spanFromCtx(f) });
      }
      return { kind: "VariantExpr", ctor, fields, span };
    }
    const argsRule = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ArgListContext) as ArgListContext | undefined;
    if (argsRule) {
      const args = ((argsRule.children ?? []) as ParseTree[]).filter((x): x is ExprContext => x instanceof ExprContext).map(x => this.V<Expr>(x));
      const fields = args.length === 1
        ? [{ kind: "VariantFieldInit", key: mkIdent("value", span), value: args[0], span }]
        : args.map((a, i: number) => ({ kind: "VariantFieldInit", key: mkIdent("v" + i, span), value: a, span }));
      return { kind: "VariantExpr", ctor, fields, span };
    }
    return { kind: "VariantExpr", ctor, span };
  }
  visitArrayExpr(ctx: ArrayExprContext) { const els = ((ctx.children ?? []) as ParseTree[]).filter((c): c is ExprContext => c instanceof ExprContext).map(c => this.V<Expr>(c)); return { kind: "ArrayExpr", elements: els, span: spanFromCtx(ctx) }; }
  visitMapExpr(ctx: MapExprContext) {
    const entries: any[] = [];
    for (const e of (ctx.children ?? []) as ParseTree[]) if (e instanceof MapEntryRt) {
      const [k,v] = ((e.children ?? []) as ParseTree[]).filter((c): c is ExprContext => c instanceof ExprContext);
      entries.push({ kind: "MapEntry", key: this.V<Expr>(k), value: this.V<Expr>(v), span: spanFromCtx(e) });
    }
    return { kind: "MapExpr", entries, span: spanFromCtx(ctx) };
  }
  visitMatchExpr(ctx: MatchExprContext) {
    const span = spanFromCtx(ctx); const expr = this.V<Expr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ExprContext));
    const cases: any[] = [];
    for (const c of (ctx.children ?? []) as ParseTree[]) if (c instanceof CaseClauseContext) cases.push(this.visitCaseClause(c));
    return { kind: "MatchExpr", expr, cases, span };
  }
  visitCaseClause(ctx: CaseClauseContext) {
    const span = spanFromCtx(ctx); const pattern = this.V(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof PatternContext));
    const guard = ((ctx.children ?? []) as ParseTree[]).find(c => isTerminal(c) && c.getText() === "if") ? this.V<Expr>(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof ExprContext)) : undefined;
    const bodyRule = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof BlockContext || c instanceof ExprContext) as ParseTree | undefined;
    const body = bodyRule instanceof BlockContext ? this.visitBlock(bodyRule) : this.V<Expr>(bodyRule);
    return { kind: "CaseClause", pattern, guard, body, span };
  }

  visitLambdaExpr(ctx: LambdaExprContext) {
    const span = spanFromCtx(ctx); const params: any[] = [];
    const list = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof TypedParamListContext) as TypedParamListContext | undefined;
    if (list) for (const p of (list.children ?? []) as ParseTree[]) if (p instanceof TypedParamContext) {
      const name = id(((p.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined);
      const type = this.V<TypeExpr>(((p.children ?? []) as ParseTree[]).find(c => c instanceof TypeExprContext));
      params.push({ kind: "LambdaParam", name, type, span: spanFromCtx(p as any) });
    }
    const returnType = ((ctx.children ?? []) as ParseTree[]).find(c => isTerminal(c) && c.getText() === ":") ? this.V<TypeExpr>(((ctx.children ?? []) as ParseTree[]).slice().reverse().find(c => c instanceof TypeExprContext)) : undefined;
    const bodyRule = ((ctx.children ?? []) as ParseTree[]).slice().reverse().find(c => c instanceof BlockContext || c instanceof ExprContext) as ParseTree | undefined;
    const body = bodyRule instanceof BlockContext ? this.visitBlock(bodyRule) : this.V<Expr>(bodyRule);
    return { kind: "LambdaExpr", params, returnType, body, span };
  }

  visitPattern(ctx: PatternContext) {
    if (((ctx.children ?? []) as ParseTree[]).some(c => c instanceof LiteralContext)) {
      return { kind: "LiteralPattern", value: this.visitLiteral(((ctx.children ?? []) as ParseTree[]).find(c => c instanceof LiteralContext) as LiteralContext), span: spanFromCtx(ctx) };
    }
    if (((ctx.children ?? []) as ParseTree[]).some(c => c instanceof WildcardPatternContext)) {
      return { kind: "LiteralPattern", value: { kind: "String", value: "_", span: spanFromCtx(ctx) }, span: spanFromCtx(ctx) };
    }
    const idn = ((ctx.children ?? []) as ParseTree[]).find(c => c instanceof IdentRule) as IdentRule | undefined;
    if (idn) return { kind: "VariantPattern", head: { tag: "Named", name: id(idn) }, span: spanFromCtx(ctx) };
    return { kind: "LiteralPattern", value: { kind: "Bool", value: true, span: spanFromCtx(ctx) }, span: spanFromCtx(ctx) };
  }
}
`;

const fileText = [
  header,
  visitFileSection,
  visitSections,
  visitTypes,
  visitDecls,
  visitBlocksStmts,
  visitExprs,
].join("");

// Crear carpeta y escribir
fs.mkdirSync(GENERATED_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, fileText, "utf8");
console.log(`✅ _generated ${path.relative(ROOT, OUT_FILE)}`);
