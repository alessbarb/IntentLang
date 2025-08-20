export type Brand<B extends string> = { readonly __brand: B };
export type Result<T, E> = { type: "Ok"; value: T } | { type: "Err"; error: E };

export type Fixed2 = number & Brand<"Fixed2">;

export function fixed2Mul(a: Fixed2, b: Fixed2): Fixed2 {
  return (((a as number) * (b as number)) / 100) as Fixed2;
}

let rng: () => number = Math.random;
let clock: () => number = () => Date.now();

/**
 * Configure deterministic runtime primitives.
 */
export function initRuntime(
  opts: { seedRng?: number; seedClock?: number } = {},
): void {
  if (opts.seedRng !== undefined) {
    let state = opts.seedRng >>> 0;
    rng = () => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0xffffffff;
    };
  } else {
    rng = Math.random;
  }

  if (opts.seedClock !== undefined) {
    let now = opts.seedClock;
    clock = () => now++;
  } else {
    clock = () => Date.now();
  }
}

/** Return a pseudo-random number in [0,1). */
export function random(): number {
  return rng();
}

/** Return milliseconds since epoch. */
export function now(): number {
  return clock();
}
