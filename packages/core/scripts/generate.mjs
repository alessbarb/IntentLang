#!/usr/bin/env node
import fs from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts });
    p.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function main() {
  await run("node", ["./scripts/ebnf2g4.mjs", "-i", "grammar/IntentLang.ebnf", "-o", "grammar/IntentLang.g4", "--grammar", "IntentLang"]);
  await run("pnpm", ["dlx", "antlr4ts-cli", "-visitor", "-o", "src/generated/grammar", "grammar/IntentLang.g4"]);
  await run("node", ["./scripts/patch-antlr-esm.mjs", "src/generated/grammar"]);
  const visitorScript = path.join("scripts", "gen-visitor.mjs");
  if (fs.existsSync(path.join(ROOT, visitorScript))) {
    await run("node", [visitorScript]);
  }

  const astNodesScript = path.join("scripts", "gen-ast-nodes.mjs");
  if (fs.existsSync(path.join(ROOT, astNodesScript))) {
    await run("node", [astNodesScript]);
  }
  const fmtTargets = [
    "grammar/IntentLang.g4",
    "src/generated/grammar",
  ];
  const visitorOut = "src/parser/visitor.gen.ts";
  if (fs.existsSync(path.join(ROOT, visitorOut))) fmtTargets.push(visitorOut);
  const nodesOut = "src/ast/nodes.gen.ts";
  if (fs.existsSync(path.join(ROOT, nodesOut))) fmtTargets.push(nodesOut);

  try {
    await run("npx", ["-y", "intent", "fmt", ...fmtTargets]);
  } catch {
    console.warn("intent fmt not found; skipping formatting");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

