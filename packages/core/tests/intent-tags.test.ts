import { test, expect } from "vitest";
import { parse } from "../src/parser.js";

// Ensure intent section accepts optional tags

test("parses intent without tags", () => {
  const program = parse('intent "Svc"');
  expect(program.intent?.description).toBe("Svc");
  expect(program.intent?.tags).toBeUndefined();
});

test("parses intent with tags", () => {
  const program = parse('intent "Svc" tags ["a", "b"]');
  expect(program.intent?.tags).toEqual(["a", "b"]);
});
