// src/pos.ts
import type { ParserRuleContext, Token } from "antlr4ng";

export interface Position {
  line: number;
  column: number;
}
export interface Span {
  start: Position;
  end: Position;
}

export function spanFromTokens(start: Token, stop: Token): Span {
  const s = start ?? stop;
  const e = stop ?? start;
  return {
    start: { line: s.line, column: s.column },
    end: { line: e.line, column: e.column + (e.text?.length ?? 1) },
  };
}

export function spanFromCtx(ctx: ParserRuleContext): Span {
  return spanFromTokens(ctx.start!, ctx.stop ?? ctx.start!);
}
