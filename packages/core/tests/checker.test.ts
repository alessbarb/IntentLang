import { test, expect } from "vitest";
import { parse } from "../src/parser.js";
import { check } from "../src/checker.js";

test("checks for exhaustive match on literal unions", () => {
  const il = `
    types {
      type Status = "active" | "inactive";
    }

    func checkStatus(s: Status): String {
      return match s {
        "active" => "Status: active";
      };
    }
  `;
  const program = parse(il);
  const diags = check(program);
  expect(diags).toHaveLength(1);
  expect(diags[0].level).toBe("error");
  expect(diags[0].message).toMatch(/Non-exhaustive match. Missing: inactive/);
});

test("reports unreachable cases in match statements", () => {
  const il = `
    types {
      type Status = OkStatus | ErrStatus;
    }
    func getResult(s: Status): String {
      return match s {
        OkStatus => "ok";
        OkStatus => "duplicate"; // this should be a warning
        ErrStatus => "error";
      };
    }
  `;
  const program = parse(il);
  const diags = check(program);
  expect(diags).toHaveLength(1);
  expect(diags[0].level).toBe("warning");
  expect(diags[0].message).toMatch(/Unreachable duplicate case/);
});