// packages/core/src/ast.ts
// AST v0.2 — adds Expr/Stmt/Pattern and real bodies in func/effect

export type Position = { line: number; column: number; index: number };
export type Span = { start: Position; end: Position };

export type Identifier = { kind: "Identifier"; name: string; span: Span };

export type Program = {
  kind: "Program";
  intent?: IntentSection;
  uses?: UsesSection;
  types?: TypesSection;
  items: TopLevel[];
  span: Span;
};

export type IntentSection = {
  kind: "IntentSection";
  description: string;
  tags?: string[];
  span: Span;
};

export type UsesSection = {
  kind: "UsesSection";
  entries: UseDecl[];
  span: Span;
};

export type UseDecl = {
  kind: "UseDecl";
  name: Identifier; // e.g., http
  typeName: Identifier; // e.g., Http
  params: Record<string, Literal>;
  span: Span;
};

export type TypesSection = {
  kind: "TypesSection";
  declarations: TypeDecl[];
  span: Span;
};

export type TypeDecl = {
  kind: "TypeDecl";
  name: Identifier;
  expr: TypeExpr;
  refinement?: string;
  span: Span;
};

export type TypeExpr =
  | BasicType
  | BrandType
  | NamedType
  | RecordType
  | UnionType
  | GenericType
  | LiteralType;

export type BasicType = {
  kind: "BasicType";
  name: "Bool" | "Int" | "Float" | "String" | "Bytes" | "Uuid" | "DateTime";
  span: Span;
};

export type BrandType = {
  kind: "BrandType";
  base: BasicType;
  brand: string;
  span: Span;
};

export type NamedType = {
  kind: "NamedType";
  name: Identifier;
  span: Span;
};

export type RecordField = {
  kind: "RecordField";
  name: Identifier;
  type: TypeExpr;
  refinement?: string;
  span: Span;
};

export type RecordType = {
  kind: "RecordType";
  fields: RecordField[];
  span: Span;
};

// Unions: named constructors or literals (e.g. "EUR")
export type UnionCtor =
  | { kind: "NamedCtor"; name: Identifier; fields?: RecordType; span: Span }
  | { kind: "LiteralCtor"; literal: LiteralType; span: Span };

export type UnionType = {
  kind: "UnionType";
  ctors: UnionCtor[];
  span: Span;
};

export type GenericType = {
  kind: "GenericType";
  name: Identifier; // List, Map, Option, Result...
  params: TypeExpr[];
  span: Span;
};

export type LiteralType = { kind: "LiteralType"; value: string; span: Span };

export type Literal =
  | { kind: "String"; value: string; span: Span }
  | { kind: "Number"; value: number; span: Span }
  | { kind: "Bool"; value: boolean; span: Span };

/* ========= Declarations ========= */

export type FuncDecl = {
  kind: "FuncDecl";
  name: Identifier;
  params: ParamSig[];
  returnType: TypeExpr;
  contracts?: { requires?: Expr; ensures?: Expr };
  body: Block; // v0.2: real body
  span: Span;
};

export type EffectDecl = {
  kind: "EffectDecl";
  name: Identifier;
  params: ParamSig[];
  returnType: TypeExpr;
  contracts?: { requires?: Expr; ensures?: Expr };
  uses: Identifier[]; // required capabilities
  body: Block; // v0.2: real body
  span: Span;
};

export type TestDecl = {
  kind: "TestDecl";
  name: Identifier;
  body: TestBlock;
  span: Span;
};

export type ParamSig = {
  kind: "ParamSig";
  name: Identifier;
  type: TypeExpr;
  span: Span;
};

export type TopLevel =
  | FuncDecl
  | EffectDecl
  | TestDecl
  | TypesSection
  | UsesSection
  | IntentSection;

/* ========= Statements ========= */

export type Block = { kind: "Block"; statements: Stmt[]; span: Span };

export type TestBlock = { kind: "TestBlock"; statements: Stmt[]; span: Span };

export type Stmt =
  | LetStmt
  | ReturnStmt
  | IfStmt
  | MatchStmt
  | ForStmt
  | ExprStmt;

export type LetStmt = {
  kind: "LetStmt";
  id: Identifier;
  init: Expr;
  span: Span;
};
export type ReturnStmt = { kind: "ReturnStmt"; argument?: Expr; span: Span };
export type IfStmt = {
  kind: "IfStmt";
  test: Expr;
  consequent: Block;
  alternate?: Block;
  span: Span;
};
export type MatchStmt = {
  kind: "MatchStmt";
  expr: Expr;
  cases: CaseClause[];
  span: Span;
};
export type ForStmt = {
  kind: "ForStmt";
  iterator: Identifier;
  iterable: Expr;
  body: Block;
  span: Span;
};
export type ExprStmt = { kind: "ExprStmt"; expression: Expr; span: Span };

/* ========= Expressions ========= */

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

export type LiteralExpr = { kind: "LiteralExpr"; value: Literal; span: Span };
export type IdentifierExpr = {
  kind: "IdentifierExpr";
  id: Identifier;
  span: Span;
};
export type ObjectField = {
  kind: "ObjectField";
  key: Identifier;
  value: Expr;
  span: Span;
};
export type ObjectExpr = {
  kind: "ObjectExpr";
  fields: ObjectField[];
  span: Span;
};
export type ArrayExpr = { kind: "ArrayExpr"; elements: Expr[]; span: Span };
export type CallExpr = {
  kind: "CallExpr";
  callee: Expr;
  args: Expr[];
  span: Span;
};
export type MemberExpr = {
  kind: "MemberExpr";
  object: Expr;
  property: Identifier;
  span: Span;
};
export type UnaryOp = "!" | "-" | "~";
export type UnaryExpr = {
  kind: "UnaryExpr";
  op: UnaryOp;
  argument: Expr;
  span: Span;
};
export type UpdateOp = "++" | "--";
export type UpdateExpr = {
  kind: "UpdateExpr";
  op: UpdateOp;
  argument: Expr;
  prefix: boolean;
  span: Span;
};
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
export type BinaryExpr = {
  kind: "BinaryExpr";
  op: BinaryOp;
  left: Expr;
  right: Expr;
  span: Span;
};
export type AssignOp = "=" | "+=" | "-=" | "*=" | "/=" | "%=";
export type AssignExpr = {
  kind: "AssignExpr";
  op: AssignOp;
  left: Expr;
  right: Expr;
  span: Span;
};
export type ConditionalExpr = {
  kind: "ConditionalExpr";
  test: Expr;
  consequent: Expr;
  alternate: Expr;
  span: Span;
};

export type ResultOkExpr = { kind: "ResultOkExpr"; value: Expr; span: Span };
export type ResultErrExpr = { kind: "ResultErrExpr"; error: Expr; span: Span };
export type OptionSomeExpr = {
  kind: "OptionSomeExpr";
  value: Expr;
  span: Span;
};
export type OptionNoneExpr = { kind: "OptionNoneExpr"; span: Span };
export type BrandCastExpr = {
  kind: "BrandCastExpr";
  target: TypeExpr | Identifier;
  value: Expr;
  span: Span;
};

export type VariantFieldInit = {
  kind: "VariantFieldInit";
  key: Identifier;
  value: Expr;
  span: Span;
};
export type VariantExpr = {
  kind: "VariantExpr";
  ctor: Identifier;
  fields?: VariantFieldInit[];
  span: Span;
};

export type MatchExpr = {
  kind: "MatchExpr";
  expr: Expr;
  cases: CaseClause[];
  span: Span;
};
export type CaseClause = {
  kind: "CaseClause";
  pattern: Pattern;
  body: Block | Expr;
  span: Span;
};

/* ========= Patterns ========= */

export type PatternField = {
  kind: "PatternField";
  name: Identifier;
  alias?: Identifier;
  span: Span;
};

export type Pattern = VariantPattern | LiteralPattern;

export type VariantPattern = {
  kind: "VariantPattern";
  head: { tag: "Named"; name: Identifier } | { tag: "Literal"; value: Literal };
  fields?: PatternField[];
  span: Span;
};

export type LiteralPattern = {
  kind: "LiteralPattern";
  value: Literal;
  span: Span;
};
