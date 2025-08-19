import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import pc from "picocolors";
import { parse, check, emitTypeScript } from "@il/core";

const ROOT = resolve(process.cwd(), "..", "..");
const EXAMPLES = resolve(ROOT, "packages/examples");
const GOLDENS = resolve(EXAMPLES, "goldens");
const PRELUDE = readFileSync(resolve(GOLDENS, "_prelude.ts"), "utf8");

const only = process.env.ONLY?.split(",").filter(Boolean);
const update = !!process.env.UPDATE;

const examples = (
  only?.length ? only : readdirSync(EXAMPLES).filter((f) => f.endsWith(".il"))
).map((f) => resolve(EXAMPLES, f));

let failed = 0;
for (const il of examples) {
  const src = readFileSync(il, "utf8");
  const program = parse(src);
  const diags = check(program);
  const errs = diags.filter((d) => d.level === "error");
  if (errs.length) {
    console.error(pc.red(`✗ ${basename(il)} — checker reported errors`));
    failed++;
    continue;
  }
  const ts = emitTypeScript(program);
  const out = PRELUDE + "\n\n" + ts;
  const golden = resolve(GOLDENS, basename(il).replace(/\.il$/, ".ts"));
  if (update) {
    writeFileSync(golden, out, "utf8");
    console.log(pc.green(`✓ updated ${basename(golden)}`));
  } else {
    const want = readFileSync(golden, "utf8");
    if (want !== out) {
      console.error(pc.red(`✗ ${basename(il)} — mismatch with golden`));
      failed++;
    } else {
      console.log(pc.green(`✓ ${basename(il)}`));
    }
  }
}

if (failed) process.exit(1);
