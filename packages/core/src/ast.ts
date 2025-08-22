/**
 * Abstract Syntax Tree node definitions for IntentLang.
 * Unified model with a common Node<K> base carrying a source span.
 */

/* ========== Source positions ========== */

export type Position = { line: number; column: number; index: number };
export type Span = { start: Position; end: Position };

/** Base node with a discriminant and source span. */
export type Node<K extends string> = { kind: K; span: Span };

/** Identifier node */
export interface Identifier extends Node<"Identifier"> {
  name: string;
}

/* =======================
 * Program & Sections
 * ======================= */

export interface Program extends Node<"Program"> {
  intent?: IntentSection;
  uses?: UsesSection;
  types?: TypesSection;
  items: TopLevel[];
}

export interface IntentSection extends Node<"IntentSection"> {
  description: string;
  tags?: string[];
}

export interface UsesSection extends Node<"UsesSection"> {
  entries: UseDecl[];
}

export interface UseDecl extends Node<"UseDecl"> {
  /** Capability alias referenced within programs. */
  name: Identifier;
  /** Name of the capability type providing the implementation. */
  typeName: Identifier;
  /** Key-value parameters configuring the capability. */
  params: Record<string, Literal>;
}

export interface TypesSection extends Node<"TypesSection"> {
  declarations: TypeDecl[];
}

export interface TypeDecl extends Node<"TypeDecl"> {
  name: Identifier;
  expr: TypeExpr;
  /** Optional refinement predicate string form. */
  refinement?: string;
}

export type TopLevel =
  | FuncDecl
  | EffectDecl
  | TestDecl
  | TypesSection
  | UsesSection
  | IntentSection;

/* =======================
 * Types
 * ======================= */

export type BasicName =
  | "Unit"
  | "Bool"
  | "Int"
  | "Float"
  | "String"
  | "Bytes"
  | "Uuid"
  | "DateTime";

export interface BasicType extends Node<"BasicType"> {
  name: BasicName;
}

export interface BrandType extends Node<"BrandType"> {
  base: BasicType;
  brand: string;
}

export interface NamedType extends Node<"NamedType"> {
  name: Identifier;
}

export interface RecordField extends Node<"RecordField"> {
  name: Identifier;
  type: TypeExpr;
  refinement?: string;
}

export interface RecordType extends Node<"RecordType"> {
  fields: RecordField[];
}

export interface LiteralType extends Node<"LiteralType"> {
  value: string;
}

/** Union constructors can be either named (with optional record fields) or literal. */
export type UnionCtor =
  | (Node<"NamedCtor"> & {
      kind: "NamedCtor";
      name: Identifier;
      fields?: RecordType;
    })
  | (Node<"LiteralCtor"> & {
      kind: "LiteralCtor";
      literal: LiteralType;
    });

export interface UnionType extends Node<"UnionType"> {
  ctors: UnionCtor[];
}

export interface GenericType extends Node<"GenericType"> {
  /** Generic type name such as `List` or `Option`. */
  name: Identifier;
  params: TypeExpr[];
}

export type TypeExpr =
  | BasicType
  | BrandType
  | NamedType
  | RecordType
  | UnionType
  | GenericType
  | LiteralType;

/* =======================
 * Literals
 * ======================= */

export type Literal =
  | (Node<"String"> & { kind: "String"; value: string })
  | (Node<"Number"> & { kind: "Number"; value: number })
  | (Node<"Bool"> & { kind: "Bool"; value: boolean });

/* =======================
 * Signatures & Decls
 * ======================= */

export interface ParamSig extends Node<"ParamSig"> {
  name: Identifier;
  type: TypeExpr;
}

export interface FuncDecl extends Node<"FuncDecl"> {
  name: Identifier;
  params: ParamSig[];
  returnType: TypeExpr;
  contracts?: { requires?: Expr; ensures?: Expr };
  /** Function body. */
  body: Block;
}

export interface EffectDecl extends Node<"EffectDecl"> {
  name: Identifier;
  params: ParamSig[];
  returnType: TypeExpr;
  contracts?: { requires?: Expr; ensures?: Expr };
  /** Capabilities required by this effect. */
  uses: Identifier[];
  /** Effect body. */
  body: Block;
}

export interface TestDecl extends Node<"TestDecl"> {
  name: Identifier;
  body: TestBlock;
}

/* =======================
 * Blocks & Statements
 * ======================= */

export interface Block extends Node<"Block"> {
  statements: Stmt[];
}

export interface TestBlock extends Node<"TestBlock"> {
  statements: Stmt[];
}

export type Stmt =
  | LetStmt
  | ReturnStmt
  | IfStmt
  | MatchStmt
  | ForStmt
  | ExprStmt;

export interface LetStmt extends Node<"LetStmt"> {
  id: Identifier;
  init: Expr;
}

export interface ReturnStmt extends Node<"ReturnStmt"> {
  argument?: Expr;
}

export interface IfStmt extends Node<"IfStmt"> {
  test: Expr;
  consequent: Block;
  alternate?: Block;
}

export interface MatchStmt extends Node<"MatchStmt"> {
  expr: Expr;
  cases: CaseClause[];
}

export interface ForStmt extends Node<"ForStmt"> {
  iterator: Identifier;
  iterable: Expr;
  body: Block;
}

export interface ExprStmt extends Node<"ExprStmt"> {
  expression: Expr;
}

/* =======================
 * Expressions
 * ======================= */

export type Expr =
  | LiteralExpr
  | IdentifierExpr
  | ObjectExpr
  | ArrayExpr
  | CallExpr
  | MemberExpr
  | UnaryExpr
  | UpdateExpr
  | BinaryExpr
  | AssignExpr
  | ConditionalExpr
  | ResultOkExpr
  | ResultErrExpr
  | OptionSomeExpr
  | OptionNoneExpr
  | BrandCastExpr
  | VariantExpr
  | MatchExpr;

export interface LiteralExpr extends Node<"LiteralExpr"> {
  value: Literal;
}

export interface IdentifierExpr extends Node<"IdentifierExpr"> {
  id: Identifier;
}

export interface ObjectField extends Node<"ObjectField"> {
  key: Identifier;
  value: Expr;
}

export interface ObjectExpr extends Node<"ObjectExpr"> {
  fields: ObjectField[];
}

export interface ArrayExpr extends Node<"ArrayExpr"> {
  elements: Expr[];
}

export interface CallExpr extends Node<"CallExpr"> {
  callee: Expr;
  args: Expr[];
}

export interface MemberExpr extends Node<"MemberExpr"> {
  object: Expr;
  property: Identifier;
}

export type UnaryOp = "!" | "-" | "~";
export interface UnaryExpr extends Node<"UnaryExpr"> {
  op: UnaryOp;
  argument: Expr;
}

export type UpdateOp = "++" | "--";
export interface UpdateExpr extends Node<"UpdateExpr"> {
  op: UpdateOp;
  argument: Expr;
  /** true for prefix (e.g., ++x), false for postfix (x++) */
  prefix: boolean;
}

export type BinaryOp =
  | "||"
  | "&&"
  | "|"
  | "^"
  | "&"
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "<<"
  | ">>"
  | "+"
  | "-"
  | "*"
  | "/"
  | "%";

export interface BinaryExpr extends Node<"BinaryExpr"> {
  op: BinaryOp;
  left: Expr;
  right: Expr;
}

export type AssignOp = "=" | "+=" | "-=" | "*=" | "/=" | "%=";
export interface AssignExpr extends Node<"AssignExpr"> {
  op: AssignOp;
  left: Expr;
  right: Expr;
}

export interface ConditionalExpr extends Node<"ConditionalExpr"> {
  test: Expr;
  consequent: Expr;
  alternate: Expr;
}

export interface ResultOkExpr extends Node<"ResultOkExpr"> {
  value: Expr;
}

export interface ResultErrExpr extends Node<"ResultErrExpr"> {
  error: Expr;
}

export interface OptionSomeExpr extends Node<"OptionSomeExpr"> {
  value: Expr;
}

export type OptionNoneExpr = Node<"OptionNoneExpr">;

export interface BrandCastExpr extends Node<"BrandCastExpr"> {
  target: TypeExpr | Identifier;
  value: Expr;
}

export interface VariantFieldInit extends Node<"VariantFieldInit"> {
  key: Identifier;
  value: Expr;
}

export interface VariantExpr extends Node<"VariantExpr"> {
  ctor: Identifier;
  fields?: VariantFieldInit[];
}

export interface MatchExpr extends Node<"MatchExpr"> {
  expr: Expr;
  cases: CaseClause[];
}

export interface CaseClause extends Node<"CaseClause"> {
  pattern: Pattern;
  guard?: Expr;
  body: Block | Expr;
}

/* =======================
 * Patterns
 * ======================= */

export interface PatternField extends Node<"PatternField"> {
  name: Identifier;
  alias?: Identifier;
}

export type Pattern = VariantPattern | LiteralPattern;

export interface VariantPattern extends Node<"VariantPattern"> {
  head: { tag: "Named"; name: Identifier } | { tag: "Literal"; value: Literal };
  fields?: PatternField[];
}

export interface LiteralPattern extends Node<"LiteralPattern"> {
  value: Literal;
}
