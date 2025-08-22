import { test, expect, describe } from "vitest";
import { lex } from "../src/lexer.js";

test("lexes for-in loop keywords", () => {
  const tokens = lex("for x in xs {}");
  expect(tokens[0].type).toBe("kw_for");
  expect(tokens[2].type).toBe("kw_in");
});

describe("operators", () => {
  test("tokenizes multi-char operators", () => {
    const code = "== != <= >= || &&";
    const tokens = lex(code);
    expect(tokens.map((t) => t.type)).toEqual([
      "eqeq", "neq", "lte", "gte", "oror", "andand", "eof"
    ]);
  });

  test("tokenizes single-char operators", () => {
    const code = "+ - * / % < > = !";
    const tokens = lex(code);
    expect(tokens.map((t) => t.type)).toEqual([
      "plus", "minus", "star", "slash", "percent", "lt", "gt", "eq", "bang", "eof"
    ]);
  });
});

test("tokenizes strings with escapes", () => {
  const tokens = lex(`"hello \\"world\\""`);
  expect(tokens[0].value).toBe(`hello "world"`);
});
