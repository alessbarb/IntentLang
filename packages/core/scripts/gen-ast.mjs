#!/usr/bin/env node
import fs from "node:fs";
import path from "path";

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, "src");
const OUT_BASE = path.join(SRC, "_generated", "ast.base.ts");
const OUT_GLUE = path.join(SRC, "ast.ts");
const MANUAL = path.join(SRC, "manual", "ast.manual.ts");

// Genera un AST base mínimo compatible con el builder.
// Si existe ast.manual.ts, hacemos "prefer manual" en el export final.

const header = `/* AUTO-GENERATED: DO NOT EDIT. */\n`;
const spanBlock = `export interface Position { line: number; column: number; }\nexport interface Span { start: Position; end: Position; }\n`;

const types = `
export interface Identifier { kind: "Identifier"; name: string; span: Span; }
export type Literal =
  | { kind: "String"; value: string; span: Span }
  | { kind: "Number"; value: number; span: Span }
  | { kind: "Bool"; value: boolean; span: Span };

// === Tipos de TIPOS ===
export type TypeExpr =
  | BasicType | BrandType | RecordType | UnionType | GenericType | FuncType | ArrayType | MapType | LiteralType;
export interface BasicType { kind: "BasicType"; name: "Unit"|"Bool"|"Int"|"Float"|"String"|"Bytes"|"Uuid"|"DateTime"; span: Span; }
export interface BrandType { kind: "BrandType"; base: TypeExpr; brand: string; span: Span; }
export interface RecordField { kind: "RecordField"; name: Identifier; type: TypeExpr; refinement?: string; span: Span; }
export interface RecordType { kind: "RecordType"; fields: RecordField[]; span: Span; }
export interface LiteralType { kind: "LiteralType"; value: string; span: Span; }
export interface UnionCtorNamed { kind: "NamedCtor"; name: Identifier; fields?: RecordType; span: Span; }
export interface UnionCtorLiteral { kind: "LiteralCtor"; literal: LiteralType; span: Span; }
export type UnionCtor = UnionCtorNamed | UnionCtorLiteral;
export interface UnionType { kind: "UnionType"; ctors: UnionCtor[]; span: Span; }
export interface GenericType { kind: "GenericType"; name: Identifier; params: TypeExpr[]; span: Span; }
export interface FuncType { kind: "FuncType"; params: Array<{ name?: Identifier; type: TypeExpr }>; returnType: TypeExpr; span: Span; }
export interface ArrayType { kind: "ArrayType"; element: TypeExpr; span: Span; }
export interface MapType { kind: "MapType"; key: TypeExpr; value: TypeExpr; span: Span; }

// === Decls ===
export interface ParamSig { kind: "ParamSig"; name: Identifier; type: TypeExpr; span: Span; }
export interface ContractBlock { requires?: Expr; ensures?: Expr }
export interface FuncDecl { kind: "FuncDecl"; name: Identifier; params: ParamSig[]; returnType: TypeExpr; contracts?: ContractBlock; body: Block; span: Span; }
export interface EffectDecl { kind: "EffectDecl"; name: Identifier; params: ParamSig[]; returnType: TypeExpr; contracts?: ContractBlock; uses: Identifier[]; body: Block; span: Span; }
export interface TestDecl { kind: "TestDecl"; name: Identifier; body: Block; span: Span; }
export interface TypeDecl { kind: "TypeDecl"; name: Identifier; expr: TypeExpr; refinement?: string; span: Span; }
export interface UsesSection { kind: "UsesSection"; entries: UseDecl[]; span: Span; }
export interface UseDecl { /* shape definida en futuro – por ahora libre */ [k: string]: any }
export interface TypesSection { kind: "TypesSection"; declarations: TypeDecl[]; span: Span; }
export interface IntentSection { kind: "IntentSection"; description: string; tags?: string[]; span: Span; }

export type TopItem = FuncDecl | EffectDecl | TestDecl | TypesSection | UsesSection | IntentSection;
export interface Program { kind: "Program"; span: Span; intent?: IntentSection; uses?: UsesSection; types?: TypesSection; items: TopItem[]; }

// === Stmts & Blocks ===
export interface Block { kind: "Block"; statements: Stmt[]; span: Span; }
export interface LetStmt { kind: "LetStmt"; id: Identifier; init: Expr; span: Span; }
export interface ConstStmt { kind: "ConstStmt"; id: Identifier; init: Expr; span: Span; }
export interface AssignStmt { kind: "AssignStmt"; op: "="|"+="|"-="|"*="|"/="|"%="; target: LValue; value: Expr; span: Span; }
export interface UpdateStmt { kind: "UpdateStmt"; op: "++"|"--"; target: LValue; span: Span; }
export interface ReturnStmt { kind: "ReturnStmt"; argument?: Expr; span: Span; }
export interface IfStmt { kind: "IfStmt"; test: Expr; consequent: Block; alternate?: Block; span: Span; }
export interface MatchStmt { kind: "MatchStmt"; match: MatchExpr; span: Span; }
export interface ForStmt { kind: "ForStmt"; iterator: Identifier; iterable: Expr; body: Block; span: Span; }
export interface WhileStmt { kind: "WhileStmt"; test: Expr; body: Block; span: Span; }
export interface BreakStmt { kind: "BreakStmt"; span: Span; }
export interface ContinueStmt { kind: "ContinueStmt"; span: Span; }
export interface TryStmt { kind: "TryStmt"; tryBlock: Block; catchParam: Identifier; catchBlock: Block; span: Span; }
export interface ExprStmt { kind: "ExprStmt"; expression: Expr; span: Span; }
export type Stmt = LetStmt | ConstStmt | AssignStmt | UpdateStmt | ReturnStmt | IfStmt | MatchStmt | ForStmt | WhileStmt | TryStmt | BreakStmt | ContinueStmt | ExprStmt;

export interface LValue { kind: "LValue"; base: Identifier; path: LValueStep[]; span: Span; }
export type LValueStep = { kind: "LvProp"; name: Identifier; span: Span } | { kind: "LvIndex"; index: Expr; span: Span };

// === Exprs ===
export interface IdentifierExpr { kind: "IdentifierExpr"; id: Identifier; span: Span; }
export interface ObjectExpr { kind: "ObjectExpr"; fields: ObjectField[]; span: Span; }
export interface ObjectField { kind: "ObjectField"; key: Identifier; value?: Expr; span: Span; }
export interface ArrayExpr { kind: "ArrayExpr"; elements: Expr[]; span: Span; }
export interface MapExpr { kind: "MapExpr"; entries: MapEntry[]; span: Span; }
export interface MapEntry { kind: "MapEntry"; key: Expr; value: Expr; span: Span; }
export interface CallExpr { kind: "CallExpr"; callee: Expr; args: Expr[]; span: Span; }
export interface MemberExpr { kind: "MemberExpr"; object: Expr; property: Identifier; span: Span; }
export interface IndexExpr { kind: "IndexExpr"; object: Expr; index: Expr; span: Span; }
export interface UnaryExpr { kind: "UnaryExpr"; op: string; argument: Expr; span: Span; }
export interface PostfixUpdateExpr { kind: "PostfixUpdateExpr"; op: "++"|"--"; argument: Expr; span: Span; }
export interface BinaryExpr { kind: "BinaryExpr"; op: string; left: Expr; right: Expr; span: Span; }
export interface ConditionalExpr { kind: "ConditionalExpr"; test: Expr; consequent: Expr; alternate: Expr; span: Span; }
export interface LiteralExpr { kind: "LiteralExpr"; value: Literal; span: Span; }
export interface ResultOkExpr { kind: "ResultOkExpr"; value: Expr; span: Span; }
export interface ResultErrExpr { kind: "ResultErrExpr"; error: Expr; span: Span; }
export interface OptionSomeExpr { kind: "OptionSomeExpr"; value: Expr; span: Span; }
export interface OptionNoneExpr { kind: "OptionNoneExpr"; span: Span; }
export interface BrandCastExpr { kind: "BrandCastExpr"; target: Identifier; value: Expr; span: Span; }
export interface VariantFieldInit { kind: "VariantFieldInit"; key: Identifier; value: Expr; span: Span; }
export interface VariantExpr { kind: "VariantExpr"; ctor: Identifier; fields?: VariantFieldInit[]; span: Span; }

export interface PatternField { kind: "PatternField"; name: Identifier; alias?: Identifier; span: Span; }
export interface VariantPattern { kind: "VariantPattern"; head: { tag: "Named"; name: Identifier }; span: Span; }
export interface LiteralPattern { kind: "LiteralPattern"; value: Literal; span: Span; }
export interface WildcardPattern { kind: "WildcardPattern"; span: Span; }
export interface CaseClause { kind: "CaseClause"; pattern: Pattern; guard?: Expr; body: Expr | Block; span: Span; }
export type Pattern = VariantPattern | LiteralPattern | WildcardPattern; // simplificado

export interface MatchExpr { kind: "MatchExpr"; expr: Expr; cases: CaseClause[]; span: Span; }
export interface LambdaParam { kind: "LambdaParam"; name: Identifier; type: TypeExpr; span: Span; }
export interface LambdaExpr { kind: "LambdaExpr"; params: LambdaParam[]; returnType?: TypeExpr; body: Expr | Block; span: Span; }

export type Expr =
  | IdentifierExpr | ObjectExpr | ArrayExpr | MapExpr | CallExpr | MemberExpr | IndexExpr
  | UnaryExpr | PostfixUpdateExpr | BinaryExpr | ConditionalExpr | LiteralExpr
  | ResultOkExpr | ResultErrExpr | OptionSomeExpr | OptionNoneExpr | BrandCastExpr | VariantExpr | MatchExpr | LambdaExpr;
`;

const base = header + spanBlock + "\n" + types;
fs.writeFileSync(OUT_BASE, base, "utf8");

// Glue exporter: reexport manual overrides si existen
let manualNames = [];
if (fs.existsSync(MANUAL)) {
  let txt = fs.readFileSync(MANUAL, "utf8");
  // 1) eliminar comentarios de bloque y de línea
  txt = txt
    .replace(/\/\*[\s\S]*?\*\//g, "") // /* ... */
    .replace(/^\s*\/\/.*$/gm, ""); // // ...
  // 2) capturar símbolos exportados reales (anclado al inicio)
  const exportRegex =
    /^\s*export\s+(?:type|interface|const|function|class)\s+([A-Za-z0-9_]+)/gm;
  let m;
  while ((m = exportRegex.exec(txt))) manualNames.push(m[1]);
}

const baseNames = [
  "Identifier",
  "Literal",
  "TypeExpr",
  "BasicType",
  "BrandType",
  "RecordField",
  "RecordType",
  "LiteralType",
  "UnionCtorNamed",
  "UnionCtorLiteral",
  "UnionCtor",
  "UnionType",
  "GenericType",
  "FuncType",
  "ArrayType",
  "MapType",
  "ParamSig",
  "ContractBlock",
  "FuncDecl",
  "EffectDecl",
  "TestDecl",
  "TypeDecl",
  "UsesSection",
  "UseDecl",
  "TypesSection",
  "IntentSection",
  "TopItem",
  "Program",
  "Block",
  "LetStmt",
  "ConstStmt",
  "AssignStmt",
  "UpdateStmt",
  "ReturnStmt",
  "IfStmt",
  "MatchStmt",
  "ForStmt",
  "WhileStmt",
  "BreakStmt",
  "ContinueStmt",
  "TryStmt",
  "ExprStmt",
  "Stmt",
  "LValue",
  "LValueStep",
  "IdentifierExpr",
  "ObjectExpr",
  "ObjectField",
  "ArrayExpr",
  "MapExpr",
  "MapEntry",
  "CallExpr",
  "MemberExpr",
  "IndexExpr",
  "UnaryExpr",
  "PostfixUpdateExpr",
  "BinaryExpr",
  "ConditionalExpr",
  "LiteralExpr",
  "ResultOkExpr",
  "ResultErrExpr",
  "OptionSomeExpr",
  "OptionNoneExpr",
  "BrandCastExpr",
  "VariantFieldInit",
  "VariantExpr",
  "PatternField",
  "VariantPattern",
  "LiteralPattern",
  "WildcardPattern",
  "CaseClause",
  "Pattern",
  "MatchExpr",
  "LambdaParam",
  "LambdaExpr",
  "Expr",
  "Position",
  "Span",
];

const glueLines = [
  header,
  `// Preferimos overrides manuales cuando existan`,
  ...baseNames.map((n) =>
    manualNames.includes(n)
      ? `export type { ${n} } from "./manual/ast.manual.js";`
      : `export type { ${n} } from "./_generated/ast.base.js";`,
  ),
].join("\n");

fs.writeFileSync(OUT_GLUE, glueLines + "\n", "utf8");
console.log("✅ _generated src/_generated/ast.base.ts + src/ast.ts");
