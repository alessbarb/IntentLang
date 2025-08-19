import { test, expect } from "vitest";
import { fixed2Mul, Fixed2 } from "../src/runtime/index.js";

test("fixed2Mul multiplies two Fixed2 values", () => {
  const a = 200 as Fixed2; // 2.00
  const b = 150 as Fixed2; // 1.50
  const result = fixed2Mul(a, b);
  expect(result).toBe(300); // 3.00
});
