import { test, expect } from "vitest";
import { lex } from "../src/lexer.js";

test("lexes for-in loop keywords", () => {
  const tokens = lex("for x in xs {}");
  expect(tokens[0].type).toBe("kw_for");
  expect(tokens[2].type).toBe("kw_in");
});
