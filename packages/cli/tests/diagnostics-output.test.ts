import { test, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
spawnSync("pnpm", ["--filter", "@il/core", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});
spawnSync("pnpm", ["--filter", "@il/cli", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));

test("diagnostics include snippet with caret and stable code", () => {
  const tmp = mkdtempSync(join(tmpdir(), "ilc-diag-"));
  const file = join(tmp, "bad.il");
  writeFileSync(file, `intent "X" tags []\nuses {}\ntypes {}\neffect boom(): Int uses http {}\n`);

  const resHuman = spawnSync("node", [cliPath, "check", file, "--no-color"], {
    encoding: "utf8",
  });
  expect(resHuman.status).toBe(1);
  expect(resHuman.stderr).not.toMatch(/\x1b\[/);
  expect(resHuman.stderr).toContain("ILC0301");
  expect(resHuman.stderr).toContain("bad.il:4:7");
  expect(resHuman.stderr).toContain("effect boom(): Int uses http {}");
  expect(resHuman.stderr).toContain("^");

  const resJson = spawnSync("node", [cliPath, "check", file, "--json"], {
    encoding: "utf8",
  });
  expect(resJson.status).toBe(1);
  const json = JSON.parse(resJson.stdout);
  const norm = file.replace(/\\/g, "/");
  json.diagnostics[0].file = json.diagnostics[0].file.replace(norm, "<tmp>/bad.il");
  json.diags[0].file = json.diags[0].file.replace(norm, "<tmp>/bad.il");
  expect(json).toEqual({
    kind: "check",
    meta: { strict: false, watch: false },
    counts: { errors: 1, warnings: 0 },
    diagnostics: [
      {
        level: "error",
        code: "ILC0301",
        message:
          "Effect 'boom' lists undeclared capability 'http'. Add it to 'uses { ... }'.",
        span: {
          start: { line: 4, column: 7, index: 42 },
          end: { line: 4, column: 7, index: 42 },
        },
        file: "<tmp>/bad.il",
      },
    ],
    status: "error",
    diags: [
      {
        level: "error",
        code: "ILC0301",
        message:
          "Effect 'boom' lists undeclared capability 'http'. Add it to 'uses { ... }'.",
        span: {
          start: { line: 4, column: 7, index: 42 },
          end: { line: 4, column: 7, index: 42 },
        },
        file: "<tmp>/bad.il",
      },
    ],
    exitCode: 1,
  });

  rmSync(tmp, { recursive: true, force: true });
});
