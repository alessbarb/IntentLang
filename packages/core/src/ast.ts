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

/** Function type: (a: T, b: U) -> R */
export interface FuncType extends Node<"FuncType"> {
  params: Array<{ name?: Identifier; type: TypeExpr }>;
  returnType: TypeExpr;
}

/** Array<T> */
export interface ArrayType extends Node<"ArrayType"> {
  element: TypeExpr;
}

/** Map<K, V> */
export interface MapType extends Node<"MapType"> {
  key: TypeExpr;
  value: TypeExpr;
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
  | LiteralType
  | FuncType
  | ArrayType
  | MapType;

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
  /** Capabilities required by this effect (`uses a, b`). */
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

/** Property/index selection step for LValue paths. */
export type LValueStep =
  | (Node<"LvProp"> & { kind: "LvProp"; name: Identifier })
  | (Node<"LvIndex"> & { kind: "LvIndex"; index: Expr });

/** LValue: base identifier plus zero or more steps (e.g., foo.bar[0].baz). */
export interface LValue extends Node<"LValue"> {
  base: Identifier;
  path: LValueStep[];
}

export type Stmt =
  | LetStmt
  | ConstStmt
  | AssignStmt
  | UpdateStmt
  | ReturnStmt
  | IfStmt
  | MatchStmt
  | ForStmt
  | WhileStmt
  | TryStmt
  | BreakStmt
  | ContinueStmt
  | ExprStmt;

export interface LetStmt extends Node<"LetStmt"> {
  id: Identifier;
  init: Expr;
}

export interface ConstStmt extends Node<"ConstStmt"> {
  id: Identifier;
  init: Expr;
}

export type AssignOp = "=" | "+=" | "-=" | "*=" | "/=" | "%=";
export interface AssignStmt extends Node<"AssignStmt"> {
  op: AssignOp;
  target: LValue;
  value: Expr;
}

export type UpdateOp = "++" | "--";
export interface UpdateStmt extends Node<"UpdateStmt"> {
  op: UpdateOp;
  target: LValue;
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

export interface WhileStmt extends Node<"WhileStmt"> {
  test: Expr;
  body: Block;
}

export interface TryStmt extends Node<"TryStmt"> {
  tryBlock: Block;
  catchParam: Identifier;
  catchBlock: Block;
}

export type BreakStmt = Node<"BreakStmt">;
export type ContinueStmt = Node<"ContinueStmt">;

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
  | MapExpr
  | CallExpr
  | MemberExpr
  | IndexExpr
  | UnaryExpr
  | BinaryExpr
  | AssignExpr /* kept for internal lowering; parser should prefer AssignStmt */
  | ConditionalExpr
  | ResultOkExpr
  | ResultErrExpr
  | OptionSomeExpr
  | OptionNoneExpr
  | BrandCastExpr
  | VariantExpr
  | MatchExpr
  | LambdaExpr;

export interface LiteralExpr extends Node<"LiteralExpr"> {
  value: Literal;
}

export interface IdentifierExpr extends Node<"IdentifierExpr"> {
  id: Identifier;
}

/** Record field; value is optional to allow shorthand { x }. */
export interface ObjectField extends Node<"ObjectField"> {
  key: Identifier;
  value?: Expr;
}

export interface ObjectExpr extends Node<"ObjectExpr"> {
  fields: ObjectField[];
}

export interface ArrayExpr extends Node<"ArrayExpr"> {
  elements: Expr[];
}

export interface MapEntry extends Node<"MapEntry"> {
  key: Expr;
  value: Expr;
}

export interface MapExpr extends Node<"MapExpr"> {
  entries: MapEntry[];
}

export interface CallExpr extends Node<"CallExpr"> {
  callee: Expr;
  args: Expr[];
}

export interface MemberExpr extends Node<"MemberExpr"> {
  object: Expr;
  property: Identifier;
}

/** Computed property/index access: obj[expr] */
export interface IndexExpr extends Node<"IndexExpr"> {
  object: Expr;
  index: Expr;
}

export type UnaryOp = "!" | "-" | "~";
export interface UnaryExpr extends Node<"UnaryExpr"> {
  op: UnaryOp;
  argument: Expr;
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

/** Expression-level assignment (for internal transforms). Prefer AssignStmt in parser. */
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
  /** EBNF: brand "<" ident ">" "(" Expr ")" — el target es un Identificador. */
  target: Identifier;
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

/** Lambda: fn (params) => expr | block */
export interface LambdaParam extends Node<"LambdaParam"> {
  name: Identifier;
  type: TypeExpr;
}
export interface LambdaExpr extends Node<"LambdaExpr"> {
  params: LambdaParam[];
  returnType?: TypeExpr;
  body: Expr | Block;
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
