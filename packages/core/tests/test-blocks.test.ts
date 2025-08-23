import { test, expect } from "vitest";
import { parse } from "../src/parser/index.js";
import { check } from "../src/checker.js";

test("parses valid test blocks", () => {
  const il = `
    test sample {
      ok();
    }
    func ok(): Int requires true { return 1; }
  `;
  const program = parse(il);
  const diags = check(program);
  expect(diags).toHaveLength(0);
  const t = program.items.find((i) => i.kind === "TestDecl");
  expect(t).toBeTruthy();
  expect(t?.name.name).toBe("sample");
  expect(t?.body.statements).toHaveLength(1);
});

test("reports missing functions in test blocks", () => {
  const il = `
    test bad {
      missing();
    }
  `;
  const program = parse(il);
  const diags = check(program);
  expect(
    diags.some((d) =>
      d.message.includes("Unknown function or effect 'missing'"),
    ),
  ).toBe(true);
});
