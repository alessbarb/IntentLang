import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

function* walk(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) yield* walk(p);
    else if (name.isFile() && /\.test\.mjs$/.test(name.name)) yield p;
  }
}

const base = new URL(".", import.meta.url).pathname;

let failed = false;
for (const file of walk(base)) {
  try {
    await import(pathToFileURL(file).href);
  } catch (err) {
    failed = true;
    console.error(`\n❌ Failed: ${file}`);
    console.error(err?.stack ?? err);
  }
}

if (failed) process.exit(1);
