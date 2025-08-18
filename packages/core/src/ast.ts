export type Position = { line: number; column: number; index: number };
export type Span = { start: Position; end: Position };

export type Program = {
  kind: "Program";
  intent?: IntentSection;
  uses?: UsesSection;
  types?: TypesSection;
  funcs: FuncDecl[];
  effects: EffectDecl[];
  span: Span;
};

export type IntentSection = {
  kind: "IntentSection";
  description: string;
  tags: string[];
  span: Span;
};

export type UsesSection = {
  kind: "UsesSection";
  entries: UseDecl[];
  span: Span;
};

export type UseDecl = {
  kind: "UseDecl";
  name: string;
  typeName: string;
  params: Record<string, Literal>;
  span: Span;
};

export type Literal = string | number | boolean;

export type TypesSection = {
  kind: "TypesSection";
  declarations: TypeDecl[];
  span: Span;
};

export type TypeDecl = {
  kind: "TypeDecl";
  name: string;
  expr: TypeExpr;
  span: Span;
};

export type TypeExpr =
  | { kind: "BasicType"; name: string }
  | { kind: "BrandType"; base: TypeExpr; brand: string; refinement?: string }
  | { kind: "RecordType"; fields: Field[] }
  | { kind: "UnionType"; variants: Variant[] }
  | { kind: "RefType"; name: string };

export type Field = {
  name: string;
  type: TypeExpr;
  refinement?: string;
};

export type Variant = {
  name: string;
  fields: Field[];
};

export type FuncDecl = {
  kind: "FuncDecl";
  name: string;
  args: string;
  returnType: string;
  body: string;
  span: Span;
};

export type EffectDecl = {
  kind: "EffectDecl";
  name: string;
  args: string;
  result: string;
  uses: string[];
  body: string;
  span: Span;
};
