import { test, expect, vi } from "vitest";
import { initRuntime, now, random } from "../src/runtime/index.js";

test("initRuntime seeds the RNG for deterministic output", () => {
  initRuntime({ seedRng: 1 });
  const a = random();
  initRuntime({ seedRng: 1 }); // re-seed
  const b = random();
  expect(a).toBe(b);
  expect(random()).not.toBe(b); // subsequent calls differ
});

test("initRuntime seeds the clock for deterministic output", () => {
  const clock = vi.useFakeTimers();
  initRuntime({ seedClock: 1000 });
  const t1 = now();
  const t2 = now();
  expect(t1).toBe(1000);
  expect(t2).toBe(1001);
  clock.restoreAllMocks(); // Corrected method name
});

test("initRuntime defaults to native random and clock if no seed is provided", () => {
  const randomSpy = vi.spyOn(Math, "random");
  const nowSpy = vi.spyOn(Date, "now");

  initRuntime();
  random();
  now();

  expect(randomSpy).toHaveBeenCalled();
  expect(nowSpy).toHaveBeenCalled();

  vi.restoreAllMocks();
});