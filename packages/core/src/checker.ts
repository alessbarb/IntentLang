// v0.2 — Semantic checker: symbols, typing, purity, uses, exhaustive match
import type {
  Program,
  TypesSection,
  TypeDecl,
  TypeExpr,
  BasicType,
  BrandType,
  NamedType,
  RecordType,
  UnionType,
  GenericType,
  LiteralType,
  FuncDecl,
  EffectDecl,
  TestDecl,
  TestBlock,
  Block,
  Stmt,
  Expr,
  Identifier,
  Span,
  MatchExpr,
  CaseClause,
  Pattern,
  Literal,
  VariantPattern,
  LiteralPattern,
  MatchStmt,
  ForStmt,
} from "./ast/index.js";
import { DIAGNOSTICS } from "./diagnostics.js";

/* Diagnostics */
export type Diagnostic = {
  level: "error" | "warning";
  code: string;
  message: string;
  span?: Span;
};

function report(
  diags: Diagnostic[],
  code: keyof typeof DIAGNOSTICS,
  span: Span | undefined,
  params: Record<string, string | number>,
): void {
  const def = DIAGNOSTICS[code];
  let message: string = def.message;
  for (const [key, value] of Object.entries(params)) {
    message = message.replace(`{${key}}`, String(value));
  }
  const level: Diagnostic["level"] = def.level;
  diags.push({
    level,
    code,
    message,
    span,
  });
}

/* Internal types (checker) */
type T =
  | { kind: "Unit" }
  | { kind: "Bool" }
  | { kind: "Number" }
  | { kind: "String" }
  | { kind: "Bytes" }
  | { kind: "Uuid" }
  | { kind: "DateTime" }
  | { kind: "Brand"; base: "String"; brand: string }
  | { kind: "Record"; fields: Map<string, T> }
  | { kind: "UnionNamed"; ctors: Map<string, { fields?: Map<string, T> }> }
  | { kind: "UnionLiteral"; values: Set<string> }
  | { kind: "Option"; of: T }
  | { kind: "Result"; ok: T; err: T }
  | { kind: "List"; of: T }
  | { kind: "Map"; key: T; value: T }
  | { kind: "Unknown" };

const TBool: T = { kind: "Bool" },
  TNum: T = { kind: "Number" },
  TString: T = { kind: "String" };
const TUnit: T = { kind: "Unit" };
const TUuid: T = { kind: "Uuid" },
  TDate: T = { kind: "DateTime" },
  TUnknown: T = { kind: "Unknown" };

/* Symbols & context */
type TypeTable = Map<string, T>;
type FuncTable = Map<string, { params: T[]; ret: T; decl: FuncDecl }>;
type EffectTable = Map<
  string,
  { params: T[]; ret: T; uses: Set<string>; decl: EffectDecl }
>;
type Scope = Map<string, T>;

type Ctx = {
  types: TypeTable;
  funcs: FuncTable;
  effects: EffectTable;
  capsDeclared: Set<string>; // file-level uses
  diags: Diagnostic[];
  builtins: Map<string, { params: T[]; ret: T }>;
};

export function check(program: Program): Diagnostic[] {
  const ctx: Ctx = {
    types: new Map(),
    funcs: new Map(),
    effects: new Map(),
    capsDeclared: new Set(
      (program.uses?.entries ?? []).map((u) => u.name.name),
    ),
    diags: [],
    builtins: builtinSignatures(),
  };

  if (program.types) loadTypes(ctx, program.types);

  for (const item of program.items) {
    if (item.kind === "FuncDecl") {
      ctx.funcs.set(item.name.name, {
        params: item.params.map((p) => resolveType(ctx, p.type)),
        ret: resolveType(ctx, item.returnType),
        decl: item,
      });
    } else if (item.kind === "EffectDecl") {
      const sig = {
        params: item.params.map((p) => resolveType(ctx, p.type)),
        ret: resolveType(ctx, item.returnType),
        uses: new Set(item.uses.map((u) => u.name)),
        decl: item,
      };
      ctx.effects.set(item.name.name, sig);
      for (const u of sig.uses) {
        if (!ctx.capsDeclared.has(u)) {
          report(ctx.diags, "ILC0301", item.span, {
            effect: item.name.name,
            cap: u,
          });
        }
      }
    }
  }

  for (const item of program.items) {
    if (item.kind === "FuncDecl") checkFuncBody(ctx, item);
    else if (item.kind === "EffectDecl") checkEffectBody(ctx, item);
    else if (item.kind === "TestDecl") checkTest(ctx, item);
  }

  return ctx.diags;
}

/* Types loading */
function loadTypes(ctx: Ctx, types: TypesSection) {
  for (const d of types.declarations) {
    if (ctx.types.has(d.name.name)) {
      report(ctx.diags, "ILC0201", d.name.span, { type: d.name.name });
      continue;
    }
    ctx.types.set(d.name.name, resolveType(ctx, d.expr));
  }
}

function resolveType(ctx: Ctx, tx: TypeExpr): T {
  switch (tx.kind) {
    case "BasicType":
      switch (tx.name) {
        case "Unit":
          return TUnit;
        case "Bool":
          return TBool;
        case "Int":
        case "Float":
          return TNum;
        case "String":
          return TString;
        case "Bytes":
          return { kind: "Bytes" };
        case "Uuid":
          return TUuid;
        case "DateTime":
          return TDate;
      }
    case "BrandType":
      return { kind: "Brand", base: "String", brand: tx.brand };
    case "NamedType": {
      const t = ctx.types.get(tx.name.name);
      if (!t) {
        report(ctx.diags, "ILC0202", tx.span, { type: tx.name.name });
        return TUnknown;
      }
      return t;
    }
    case "LiteralType":
      return TString;
    case "RecordType": {
      const fields = new Map<string, T>();
      for (const f of tx.fields)
        fields.set(f.name.name, resolveType(ctx, f.type));
      return { kind: "Record", fields };
    }
    case "UnionType": {
      const allLit = tx.ctors.every((c) => c.kind === "LiteralCtor");
      if (allLit) {
        const values = new Set<string>();
        for (const c of tx.ctors) values.add((c as any).literal.value);
        return { kind: "UnionLiteral", values };
      } else {
        const ctors = new Map<string, { fields?: Map<string, T> }>();
        for (const c of tx.ctors) {
          if (c.kind === "LiteralCtor") {
            report(ctx.diags, "ILC0203", c.span, {});
            continue;
          }
          const name = c.name.name;
          if (ctors.has(name)) {
            report(ctx.diags, "ILC0204", c.span, { ctor: name });
            continue;
          }
          let fields: Map<string, T> | undefined;
          if (c.fields) {
            fields = new Map();
            for (const f of c.fields.fields)
              fields.set(f.name.name, resolveType(ctx, f.type));
          }
          ctors.set(name, { fields });
        }
        return { kind: "UnionNamed", ctors };
      }
    }
    case "GenericType": {
      const name = tx.name.name;
      const ps = tx.params.map((p) => resolveType(ctx, p));
      if (name === "Option" && ps.length === 1)
        return { kind: "Option", of: ps[0] };
      if (name === "Result" && ps.length === 2)
        return { kind: "Result", ok: ps[0], err: ps[1] };
      if (name === "List" && ps.length === 1)
        return { kind: "List", of: ps[0] };
      if (name === "Map" && ps.length === 2)
        return { kind: "Map", key: ps[0], value: ps[1] };
      return TUnknown;
    }
  }
}

/* Bodies */
type FlowCtx = {
  scope: Scope;
  pure: boolean;
  allowedCaps: Set<string>;
  expectedReturn: T;
  usedCaps: Set<string>;
};

function checkContract(
  ctx: Ctx,
  scope: Scope,
  expr: Expr,
  kind: "requires" | "ensures",
) {
  const t = inferExpr(
    ctx,
    {
      scope,
      pure: true,
      allowedCaps: new Set(),
      expectedReturn: TBool,
      usedCaps: new Set(),
    },
    expr,
  );
  if (!isBoolLike(t))
    report(ctx.diags, "ILC0205", expr.span, { kind, type: showType(t) });
}

function checkFuncBody(ctx: Ctx, fn: FuncDecl) {
  const scope = new Map<string, T>();
  for (const p of fn.params) scope.set(p.name.name, resolveType(ctx, p.type));
  const expected = resolveType(ctx, fn.returnType);
  const usedCaps = new Set<string>();
  if (fn.contracts?.requires)
    checkContract(ctx, scope, fn.contracts.requires, "requires");
  if (fn.contracts?.ensures)
    checkContract(ctx, scope, fn.contracts.ensures, "ensures");
  checkBlock(
    ctx,
    {
      scope,
      pure: true,
      allowedCaps: new Set(),
      expectedReturn: expected,
      usedCaps,
    },
    fn.body,
  );
  for (const c of usedCaps)
    report(ctx.diags, "ILC0302", fn.span, { func: fn.name.name, cap: c });
}

function checkEffectBody(ctx: Ctx, eff: EffectDecl) {
  const scope = new Map<string, T>();
  for (const p of eff.params) scope.set(p.name.name, resolveType(ctx, p.type));
  const expected = resolveType(ctx, eff.returnType);
  const allowed = new Set(eff.uses.map((u) => u.name));
  const usedCaps = new Set<string>();
  if (eff.contracts?.requires)
    checkContract(ctx, scope, eff.contracts.requires, "requires");
  if (eff.contracts?.ensures)
    checkContract(ctx, scope, eff.contracts.ensures, "ensures");
  checkBlock(
    ctx,
    {
      scope,
      pure: false,
      allowedCaps: allowed,
      expectedReturn: expected,
      usedCaps,
    },
    eff.body,
  );
  for (const c of usedCaps) {
    if (!ctx.capsDeclared.has(c))
      report(ctx.diags, "ILC0301", eff.span, { effect: eff.name.name, cap: c });
    else if (!allowed.has(c))
      report(ctx.diags, "ILC0303", eff.span, { effect: eff.name.name, cap: c });
  }
}

function checkTest(ctx: Ctx, t: TestDecl) {
  function visitStmt(s: Stmt) {
    switch (s.kind) {
      case "LetStmt":
        visitExpr(s.init);
        break;
      case "ReturnStmt":
        if (s.argument) visitExpr(s.argument);
        break;
      case "IfStmt":
        visitExpr(s.test);
        visitBlock(s.consequent);
        if (s.alternate) visitBlock(s.alternate);
        break;
      case "MatchStmt":
        visitExpr(s.expr);
        for (const c of s.cases) {
          if ((c.body as any).kind === "Block") visitBlock(c.body as Block);
          else visitExpr(c.body as Expr);
        }
        break;
      case "ForStmt":
        visitExpr(s.iterable);
        visitBlock(s.body);
        break;
      case "ExprStmt":
        visitExpr(s.expression);
        break;
    }
  }
  function visitBlock(b: { statements: Stmt[] }) {
    for (const st of b.statements) visitStmt(st);
  }
  function visitExpr(e: Expr) {
    switch (e.kind) {
      case "CallExpr":
        if (e.callee.kind === "IdentifierExpr") {
          const n = e.callee.id.name;
          if (
            !ctx.funcs.has(n) &&
            !ctx.effects.has(n) &&
            !ctx.builtins.has(n)
          ) {
            report(ctx.diags, "ILC0206", e.callee.id.span, { name: n });
          }
        }
        for (const a of e.args) visitExpr(a);
        break;
      case "ObjectExpr":
        for (const f of e.fields) visitExpr(f.value);
        break;
      case "ArrayExpr":
        for (const el of e.elements) visitExpr(el);
        break;
      case "MemberExpr":
        visitExpr(e.object);
        break;
      case "UnaryExpr":
        visitExpr(e.argument);
        break;
      case "BinaryExpr":
        visitExpr(e.left);
        visitExpr(e.right);
        break;
      case "ResultOkExpr":
        visitExpr(e.value);
        break;
      case "ResultErrExpr":
        visitExpr(e.error);
        break;
      case "OptionSomeExpr":
        visitExpr(e.value);
        break;
      case "BrandCastExpr":
        visitExpr(e.value);
        break;
      case "VariantExpr":
        for (const f of e.fields ?? []) visitExpr(f.value);
        break;
      case "MatchExpr":
        visitExpr(e.expr);
        for (const c of e.cases) {
          if ((c.body as any).kind === "Block") visitBlock(c.body as Block);
          else visitExpr(c.body as Expr);
        }
        break;
      default:
        break;
    }
  }
  visitBlock(t.body);
}

function checkBlock(ctx: Ctx, f: FlowCtx, block: Block) {
  for (const s of block.statements) checkStmt(ctx, f, s);
}

function checkStmt(ctx: Ctx, f: FlowCtx, s: Stmt) {
  switch (s.kind) {
    case "LetStmt": {
      const t = inferExpr(ctx, f, s.init);
      f.scope.set(s.id.name, t);
      return;
    }
    case "ReturnStmt": {
      if (s.argument) {
        const t = inferExpr(ctx, f, s.argument);
        if (!isAssignableTo(ctx, t, f.expectedReturn))
          report(ctx.diags, "ILC0207", s.span, {
            got: showType(t),
            expected: showType(f.expectedReturn),
          });
      }
      return;
    }
    case "IfStmt": {
      const t = inferExpr(ctx, f, s.test);
      if (!isBoolLike(t))
        report(ctx.diags, "ILC0208", s.test.span, { type: showType(t) });
      checkBlock(ctx, { ...f, scope: new Map(f.scope) }, s.consequent);
      if (s.alternate)
        checkBlock(ctx, { ...f, scope: new Map(f.scope) }, s.alternate);
      return;
    }
    case "MatchStmt": {
      checkMatchFromStmt(ctx, f, s);
      return;
    }
    case "ForStmt": {
      inferExpr(ctx, f, s.iterable);
      const scope = new Map(f.scope);
      scope.set(s.iterator.name, TUnknown);
      checkBlock(ctx, { ...f, scope }, s.body);
      return;
    }
    case "ExprStmt": {
      inferExpr(ctx, f, s.expression);
      return;
    }
  }
}

/* Expr typing (minimal useful) */
function inferExpr(ctx: Ctx, f: FlowCtx, e: Expr): T {
  switch (e.kind) {
    case "LiteralExpr":
      return literalToType(e.value);
    case "IdentifierExpr": {
      const name = e.id.name;
      const v = f.scope.get(name);
      if (v) return v;
      if (ctx.funcs.has(name)) return ctx.funcs.get(name)!.ret;
      report(ctx.diags, "ILC0209", e.span, { name });
      return TUnknown;
    }
    case "ObjectExpr": {
      const m = new Map<string, T>();
      for (const fld of e.fields)
        m.set(fld.key.name, inferExpr(ctx, f, fld.value));
      return { kind: "Record", fields: m };
    }
    case "ArrayExpr": {
      if (e.elements.length === 0) return { kind: "List", of: TUnknown };
      const t0 = inferExpr(ctx, f, e.elements[0]);
      return { kind: "List", of: t0 };
    }
    case "MemberExpr": {
      const o = e.object;
      if (o.kind === "IdentifierExpr" && ctx.capsDeclared.has(o.id.name)) {
        f.usedCaps.add(o.id.name);
        if (f.pure)
          report(ctx.diags, "ILC0302", e.span, {
            func: "<lambda>",
            cap: o.id.name,
          });
      }
      return TUnknown;
    }
    case "CallExpr": {
      if (e.callee.kind === "IdentifierExpr") {
        const name = e.callee.id.name;
        if (ctx.builtins.has(name)) {
          const sig = ctx.builtins.get(name)!;
          checkCallArgs(ctx, f, name, sig.params, e.args, e.span);
          return sig.ret;
        }
        if (ctx.funcs.has(name)) {
          const sig = ctx.funcs.get(name)!;
          checkCallArgs(ctx, f, name, sig.params, e.args, e.span);
          return sig.ret;
        }
      }
      if (e.callee.kind === "MemberExpr") {
        const obj = e.callee.object;
        if (
          obj.kind === "IdentifierExpr" &&
          ctx.capsDeclared.has(obj.id.name)
        ) {
          f.usedCaps.add(obj.id.name);
          if (f.pure)
            report(ctx.diags, "ILC0302", e.span, {
              func: "<lambda>",
              cap: obj.id.name,
            });
          return TUnknown;
        }
      }
      for (const a of e.args) inferExpr(ctx, f, a);
      report(ctx.diags, "ILC0210", e.span, {});
      return TUnknown;
    }
    case "UnaryExpr": {
      const v = inferExpr(ctx, f, e.argument);
      if (e.op === "!") {
        if (!isBoolLike(v))
          report(ctx.diags, "ILC0211", e.span, { type: showType(v) });
        return { kind: "Bool" };
      }
      if (e.op === "-") {
        if (!isNumberLike(v))
          report(ctx.diags, "ILC0212", e.span, { type: showType(v) });
        return { kind: "Number" };
      }
      if (e.op === "~") {
        if (!isNumberLike(v))
          report(ctx.diags, "ILC0212", e.span, { type: showType(v) });
        return { kind: "Number" };
      }
      return TUnknown;
    }
    case "UpdateExpr": {
      const v = inferExpr(ctx, f, e.argument);
      if (!isNumberLike(v)) report(ctx.diags, "ILC0216", e.span, { op: e.op });
      return { kind: "Number" };
    }
    case "BinaryExpr": {
      const l = inferExpr(ctx, f, e.left),
        r = inferExpr(ctx, f, e.right);
      switch (e.op) {
        case "&&":
        case "||":
          if (!isBoolLike(l) || !isBoolLike(r))
            report(ctx.diags, "ILC0213", e.span, { op: e.op });
          return { kind: "Bool" };
        case "==":
        case "!=":
          if (!isComparable(l, r))
            report(ctx.diags, "ILC0214", e.span, {
              op: e.op,
              left: showType(l),
              right: showType(r),
            });
          return { kind: "Bool" };
        case "<":
        case "<=":
        case ">":
        case ">=":
          if (!isNumberLike(l) || !isNumberLike(r))
            report(ctx.diags, "ILC0215", e.span, { op: e.op });
          return { kind: "Bool" };
        case "+":
        case "-":
        case "*":
        case "/":
        case "%":
        case "&":
        case "|":
        case "^":
        case "<<":
        case ">>":
          if (!isNumberLike(l) || !isNumberLike(r))
            report(ctx.diags, "ILC0216", e.span, { op: e.op });
          return { kind: "Number" };
      }
      return TUnknown;
    }
    case "AssignExpr": {
      const t = inferExpr(ctx, f, e.right);
      inferExpr(ctx, f, e.left);
      return t;
    }
    case "ConditionalExpr": {
      const t = inferExpr(ctx, f, e.test);
      if (!isBoolLike(t))
        report(ctx.diags, "ILC0211", e.test.span, { type: showType(t) });
      const c = inferExpr(ctx, f, e.consequent);
      const a = inferExpr(ctx, f, e.alternate);
      if (isAssignableTo(ctx, c, a) && isAssignableTo(ctx, a, c)) return c;
      return TUnknown;
    }
    case "ResultOkExpr": {
      const v = inferExpr(ctx, f, e.value);
      return { kind: "Result", ok: v, err: TUnknown };
    }
    case "ResultErrExpr": {
      const er = inferExpr(ctx, f, e.error);
      return { kind: "Result", ok: TUnknown, err: er };
    }
    case "OptionSomeExpr": {
      const v = inferExpr(ctx, f, e.value);
      return { kind: "Option", of: v };
    }
    case "OptionNoneExpr":
      return { kind: "Option", of: TUnknown };
    case "BrandCastExpr": {
      inferExpr(ctx, f, e.value);
      return TUnknown;
    }
    case "VariantExpr": {
      const m = new Map<string, T>();
      for (const fld of e.fields ?? [])
        m.set(fld.key.name, inferExpr(ctx, f, fld.value));
      return { kind: "Record", fields: m };
    }
    case "MatchExpr": {
      return checkMatch(ctx, f, e, e.span, /*asExpr*/ true);
    }
  }
}

function checkCallArgs(
  ctx: Ctx,
  f: FlowCtx,
  name: string,
  params: T[],
  args: Expr[],
  span?: Span,
) {
  if (args.length !== params.length)
    report(ctx.diags, "ILC0217", span, {
      name,
      expected: params.length,
      got: args.length,
    });
  const n = Math.min(args.length, params.length);
  for (let i = 0; i < n; i++) {
    const ai = inferExpr(ctx, f, args[i]);
    if (!isAssignableTo(ctx, ai, params[i]))
      report(ctx.diags, "ILC0218", args[i].span, {
        index: i + 1,
        name,
        got: showType(ai),
        expected: showType(params[i]),
      });
  }
}

/* Match exhaustiveness */
function checkMatch(
  ctx: Ctx,
  f: FlowCtx,
  m: MatchExpr,
  span?: Span,
  asExpr: boolean = false,
): T {
  const cases = m.cases;
  const t = inferExpr(ctx, f, m.expr);

  if (t.kind === "UnionNamed") {
    const domain = new Set([...t.ctors.keys()]);
    const covered = new Set<string>();
    for (const c of cases) {
      const head = caseHeadKey(c.pattern);
      if (head.kind !== "Named") {
        report(ctx.diags, "ILC0219", c.span, {});
        continue;
      }
      const ctor = head.name;
      if (!domain.has(ctor)) {
        const suggestion = suggest([...domain], ctor) ?? "a valid constructor";
        report(ctx.diags, "ILC0220", c.span, { ctor, suggestion });
      } else {
        if (covered.has(ctor)) {
          report(ctx.diags, "ILC0221", c.span, { ctor });
        } else {
          covered.add(ctor);
        }
        const ctorInfo = t.ctors.get(ctor)!;
        const caseScope = new Map(f.scope);
        if (
          c.pattern.kind === "VariantPattern" &&
          c.pattern.fields &&
          ctorInfo.fields
        ) {
          for (const pf of c.pattern.fields) {
            const fieldType = ctorInfo.fields.get(pf.name.name);
            if (!fieldType)
              report(ctx.diags, "ILC0222", pf.span, {
                ctor,
                field: pf.name.name,
              });
            else caseScope.set(pf.alias?.name ?? pf.name.name, fieldType);
          }
        }
        const sub: FlowCtx = { ...f, scope: caseScope };
        if (c.guard) {
          const g = inferExpr(ctx, sub, c.guard);
          if (!isBoolLike(g))
            report(ctx.diags, "ILC0229", c.guard.span, { type: showType(g) });
        }
        if (asExpr && (c.body as any).kind === "Block") {
          report(ctx.diags, "ILC0223", (c.body as any).span ?? c.span, {});
        } else {
          checkCaseBody(ctx, sub, c.body);
        }
      }
    }
    const missing = [...domain].filter((k) => !covered.has(k));
    if (missing.length > 0)
      report(ctx.diags, "ILC0224", span, { missing: missing.join(", ") });
    return TUnknown;
  }

  if (t.kind === "UnionLiteral") {
    const domain = new Set([...t.values]);
    const covered = new Set<string>();
    for (const c of cases) {
      const head = caseHeadKey(c.pattern);
      if (head.kind !== "Literal") {
        report(ctx.diags, "ILC0225", c.span, {});
        continue;
      }
      const lit = head.value;
      if (!domain.has(lit)) {
        const suggestion = suggest([...domain], lit) ?? "a valid literal";
        report(ctx.diags, "ILC0226", c.span, {
          literal: lit,
          suggestion,
        });
      } else {
        if (covered.has(lit)) {
          report(ctx.diags, "ILC0227", c.span, { literal: lit });
        } else {
          covered.add(lit);
        }
        if (c.guard) {
          const g = inferExpr(ctx, f, c.guard);
          if (!isBoolLike(g))
            report(ctx.diags, "ILC0229", c.guard.span, { type: showType(g) });
        }
        if (asExpr && (c.body as any).kind === "Block") {
          report(ctx.diags, "ILC0223", (c.body as any).span ?? c.span, {});
        } else {
          checkCaseBody(ctx, f, c.body);
        }
      }
    }
    const missing = [...domain].filter((k) => !covered.has(k));
    if (missing.length > 0)
      report(ctx.diags, "ILC0224", span, { missing: missing.join(", ") });
    return TUnknown;
  }

  report(ctx.diags, "ILC0228", span, { type: showType(t) });
  for (const c of cases) {
    if (c.guard) {
      const g = inferExpr(ctx, f, c.guard);
      if (!isBoolLike(g))
        report(ctx.diags, "ILC0229", c.guard.span, { type: showType(g) });
    }
    if (asExpr && (c.body as any).kind === "Block") {
      report(ctx.diags, "ILC0223", (c.body as any).span ?? c.span, {});
    } else {
      checkCaseBody(ctx, f, c.body);
    }
  }

  return TUnknown;
}

function checkCaseBody(ctx: Ctx, f: FlowCtx, body: Block | Expr) {
  if ("kind" in body && (body as any).kind === "Block")
    checkBlock(ctx, f, body as Block);
  else inferExpr(ctx, f, body as Expr);
}

function caseHeadKey(
  p: Pattern,
): { kind: "Named"; name: string } | { kind: "Literal"; value: string } {
  if (p.kind === "VariantPattern") {
    if (p.head.tag === "Named")
      return { kind: "Named", name: p.head.name.name };
    if (p.head.tag === "Literal")
      return { kind: "Literal", value: literalRepr(p.head.value) };
  }
  if (p.kind === "LiteralPattern")
    return { kind: "Literal", value: literalRepr(p.value) };
  return { kind: "Named", name: "<unknown>" };
}

/* Builtins */
function builtinSignatures(): Map<string, { params: T[]; ret: T }> {
  const m = new Map<string, { params: T[]; ret: T }>();
  const brand = (name: string): T => ({
    kind: "Brand",
    base: "String",
    brand: name,
  });

  m.set("toString", { params: [TUnknown], ret: TString });
  m.set("matches", { params: [TString, TString], ret: TBool });
  m.set("parseUuid", {
    params: [TString],
    ret: { kind: "Result", ok: TUuid, err: TString },
  });
  m.set("parseDateTime", {
    params: [TString],
    ret: { kind: "Result", ok: TDate, err: TString },
  });
  const TFixed2: T = { kind: "Brand", base: "String", brand: "Fixed2" };
  m.set("fixed2Mul", { params: [TFixed2, TFixed2], ret: TFixed2 });
  return m;
}

/* Helpers */
function literalToType(l: Literal): T {
  switch (l.kind) {
    case "Bool":
      return TBool;
    case "Number":
      return TNum;
    case "String":
      return TString;
  }
}
function isBoolLike(t: T) {
  return t.kind === "Bool";
}
function isNumberLike(t: T) {
  return t.kind === "Number";
}
function isComparable(a: T, b: T) {
  if (a.kind === b.kind) {
    if (a.kind === "Brand") return (a as any).brand === (b as any).brand;
    return true;
  }
  return false;
}
function isAssignableTo(ctx: Ctx, a: T, b: T): boolean {
  if (a.kind === "Unknown" || b.kind === "Unknown") return true;
  if (a.kind === b.kind) {
    switch (a.kind) {
      case "Unit":
        return true;
      case "Brand":
        return (a as any).brand === (b as any).brand;
      case "Record": {
        const fa = a.fields,
          fb = (b as any).fields as Map<string, T>;
        for (const [k, vt] of fb) {
          const va = fa.get(k);
          if (!va || !isAssignableTo(ctx, va, vt)) return false;
        }
        return true;
      }
      case "UnionNamed": {
        const ca = a.ctors,
          cb = (b as any).ctors as Map<string, any>;
        if (ca.size !== cb.size) return false;
        for (const [n, ib] of cb) {
          const ia = ca.get(n);
          if (!ia) return false;
          if (!!ia.fields !== !!ib.fields) return false;
        }
        return true;
      }
      case "UnionLiteral": {
        const va = a.values,
          vb = (b as any).values as Set<string>;
        if (va.size !== vb.size) return false;
        for (const v of va) if (!vb.has(v)) return false;
        return true;
      }
      case "Option":
        return isAssignableTo(ctx, a.of, (b as any).of);
      case "Result":
        return (
          isAssignableTo(ctx, a.ok, (b as any).ok) &&
          isAssignableTo(ctx, a.err, (b as any).err)
        );
      case "List":
        return isAssignableTo(ctx, a.of, (b as any).of);
      case "Map":
        return (
          isAssignableTo(ctx, a.key, (b as any).key) &&
          isAssignableTo(ctx, a.value, (b as any).value)
        );
      default:
        return true;
    }
  }
  return false;
}
function showType(t: T): string {
  switch (t.kind) {
    case "Unit":
      return "Unit";
    case "Bool":
      return "Bool";
    case "Number":
      return "Number";
    case "String":
      return "String";
    case "Bytes":
      return "Bytes";
    case "Uuid":
      return "Uuid";
    case "DateTime":
      return "DateTime";
    case "Brand":
      return `Brand<"${(t as any).brand}">`;
    case "Record":
      return `{ ${[...t.fields.entries()].map(([k, v]) => `${k}: ${showType(v)}`).join("; ")} }`;
    case "UnionNamed":
      return [...t.ctors.keys()].join(" | ");
    case "UnionLiteral":
      return [...t.values].map((v) => JSON.stringify(v)).join(" | ");
    case "Option":
      return `Option<${showType((t as any).of)}>`;
    case "Result":
      return `Result<${showType((t as any).ok)}, ${showType((t as any).err)}>`;
    case "List":
      return `List<${showType((t as any).of)}>`;
    case "Map":
      return `Map<${showType((t as any).key)}, ${showType((t as any).value)}>`;
    case "Unknown":
      return "Unknown";
  }
}
function literalRepr(l: Literal) {
  switch (l.kind) {
    case "String":
      return l.value;
    case "Number":
      return String(l.value);
    case "Bool":
      return String(l.value);
  }
}

function suggest(cands: string[], target: string) {
  let best: { s: string; d: number } | null = null;
  for (const s of cands) {
    const d = lev(s, target);
    if (!best || d < best.d) best = { s, d };
  }
  return best && best.d <= 2 ? best.s : null;
}
function lev(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[a.length][b.length];
}

function checkMatchFromStmt(ctx: Ctx, f: FlowCtx, s: MatchStmt) {
  const m: MatchExpr = {
    kind: "MatchExpr",
    expr: s.expr,
    cases: s.cases,
    span: s.span,
  };
  return checkMatch(ctx, f, m, s.span, /*asExpr*/ false);
}
