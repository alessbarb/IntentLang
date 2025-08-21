import { test, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
spawnSync("pnpm", ["--filter", "@intentlang/core", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});
spawnSync("pnpm", ["--filter", "@intentlang/entlang/cli", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));

test("intent check command", () => {
  const tmp = mkdtempSync(join(tmpdir(), "intent-check-"));
  const valid = join(tmp, "valid.il");
  writeFileSync(valid, `intent "Test" tags []\nuses {}\ntypes {}`);

  let res = spawnSync("node", [cliPath, "check", valid], { encoding: "utf8" });
  expect(res.status).toBe(0);
  expect(res.stdout).toMatch(/Check passed/);

  const bad = join(tmp, "bad.il");
  writeFileSync(
    bad,
    `intent "X" tags []\nuses {}\ntypes {}\neffect boom(): Int uses http {}`,
  );
  res = spawnSync("node", [cliPath, "check", bad], { encoding: "utf8" });
  expect(res.status).toBe(1);
  expect(res.stderr).toMatch(/undeclared capability 'http'/);

  res = spawnSync("node", [cliPath, "check", valid, "--json"], {
    encoding: "utf8",
  });
  expect(res.status).toBe(0);
  expect(res.stderr).toBe("");
  let out = JSON.parse(res.stdout);
  expect(out.status).toBe("ok");
  expect(out.diags).toHaveLength(0);

  res = spawnSync("node", [cliPath, "check", bad, "--json"], {
    encoding: "utf8",
  });
  expect(res.status).toBe(1);
  expect(res.stderr).toBe("");
  out = JSON.parse(res.stdout);
  expect(out.status).toBe("error");
  expect(out.diags.length).toBeGreaterThan(0);
  expect(out.diags[0].level).toBe("error");
  expect(out.diags[0].message).toMatch(/undeclared capability 'http'/);

  res = spawnSync("node", [cliPath, "check", join(tmp, "missing.il")], {
    encoding: "utf8",
  });
  expect(res.status).toBe(2);
  expect(res.stderr).toMatch(/Usage: intent/);

  res = spawnSync("node", [cliPath, "check", valid, "--wat"], {
    encoding: "utf8",
  });
  expect(res.status).toBe(2);
  expect(res.stderr).toMatch(/Usage: intent/);

  rmSync(tmp, { recursive: true, force: true });
});

test("--max-errors truncates errors output", () => {
  const tmp = mkdtempSync(join(tmpdir(), "intent-maxerr-"));
  const file = join(tmp, "sample.il");
  writeFileSync(
    file,
    `intent "X" tags []\nuses {}\ntypes {}\n\neffect boom1(): Int uses http {}\neffect boom2(): Int uses http {}\neffect boom3(): Int uses http {}`,
  );
  const res = spawnSync(
    "node",
    [cliPath, "check", file, "--max-errors", "2"],
    { encoding: "utf8" },
  );
  expect(res.status).toBe(1);
  const stderr = res.stderr;
  const errs = stderr.match(/undeclared capability 'http'/g) ?? [];
  expect(errs).toHaveLength(2);
  expect(stderr).toMatch(/\+1 more error\(s\) not shown\./);
  rmSync(tmp, { recursive: true, force: true });
});

test("stdin support", () => {
  const srcValid = `intent "Test" tags []\nuses {}\ntypes {}`;
  let res = spawnSync("node", [cliPath, "check", "-"], {
    encoding: "utf8",
    input: srcValid,
  });
  expect(res.status).toBe(0);
  expect(res.stdout).toMatch(/Check passed/);

  const srcInvalid =
    `intent "X" tags []\nuses {}\ntypes {}\neffect boom(): Int uses http {}`;
  res = spawnSync("node", [cliPath, "check", "-"], {
    encoding: "utf8",
    input: srcInvalid,
  });
  expect(res.status).toBe(1);
  expect(res.stderr).toMatch(/\(stdin\)/);

  res = spawnSync("node", [cliPath, "check", "-", "--json"], {
    encoding: "utf8",
    input: srcInvalid,
  });
  expect(res.status).toBe(1);
  const out = JSON.parse(res.stdout);
  expect(out.diags[0].file).toBe("(stdin)");
});

test("globbing is cross-platform and reports missing matches", () => {
  const tmp = mkdtempSync(join(tmpdir(), "intent-glob-"));
  const ok = join(tmp, "src", "good.il");
  const bad = join(tmp, "src", "sub", "bad.il");
  mkdirSync(join(tmp, "src", "sub"), { recursive: true });
  writeFileSync(ok, `intent "A" tags []\nuses {}\ntypes {}`);
  writeFileSync(
    bad,
    `intent "X" tags []\nuses {}\ntypes {}\neffect boom(): Int uses http {}`,
  );

  // forward slashes
  let res = spawnSync("node", [cliPath, "check", "src/**/*.il"], {
    cwd: tmp,
    encoding: "utf8",
  });
  expect(res.status).toBe(1);

  // Windows-style backslashes
  res = spawnSync("node", [cliPath, "check", "src\\**\\*.il"], {
    cwd: tmp,
    encoding: "utf8",
  });
  expect(res.status).toBe(1);
  const normalized = `<tmp>/${res.stderr}`;
  expect(normalized).toMatchInlineSnapshot(
    `"<tmp>/\n-- ERROR (ILC0301) --------------------------------------------------\n\nEffect 'boom' lists undeclared capability 'http'. Add it to 'uses { ... }'.\n\n  --> bad.il:4:7\n\n4 | effect boom(): Int uses http {}\n         ^\n\nCheck failed with 1 error(s).\n"`,
  );

  // quoted glob
  res = spawnSync("node", [cliPath, "check", '"src/**/*.il"'], {
    cwd: tmp,
    encoding: "utf8",
  });
  expect(res.status).toBe(1);

  // no matches
  res = spawnSync("node", [cliPath, "check", "nomatch/**/*.il"], {
    cwd: tmp,
    encoding: "utf8",
  });
  expect(res.status).toBe(2);
  expect(res.stderr).toMatch(/No files matched/);

  rmSync(tmp, { recursive: true, force: true });
});
