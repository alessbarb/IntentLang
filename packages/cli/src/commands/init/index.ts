import fs from "node:fs";
import path from "node:path";
import { colors } from "../../term/colors.js";
import { handleJsonOutput } from "../../utils/output.js";
import { failUsage } from "../../utils/cli-error.js";
import type { InitFlags } from "./types.js";

type FileSpec = { rel: string; content: string };

const ilconfig =
  `{
  // IntentLang project config
  "compilerOptions": {
    "strict": true,
    "target": "ts",
    "outDir": "dist",
    "seedRng": "42",
    "seedClock": "0"
  },
  "include": ["src/**/*.il"]
}
`.trim() + "\n";

const helloMinimal =
  `intent "hello"

types
  // A branded type for greeter names
  type Name = brand "Name" string

func
  greet(name: Name): string {
    "Hello, " + name
  }
`.trim() + "\n";

const helloWithTests =
  `intent "hello"

types
  type Name = brand "Name" string

func
  greet(name: Name): string {
    "Hello, " + name
  }

func
  // Simple deterministic test
  test_greet_hello(): void {
    let got = greet("Ada" as Name)
    requires got == "Hello, Ada"
  }
`.trim() + "\n";

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileSafe(absPath: string, content: string, force: boolean) {
  if (fs.existsSync(absPath) && !force) {
    throw Object.assign(
      new Error(`Refusing to overwrite ${absPath} (use --yes).`),
      { cliCode: "ILC0403", exitCode: 2 },
    );
  }
  ensureDir(path.dirname(absPath));
  fs.writeFileSync(absPath, content, "utf8");
}

export async function runInit(targetDir: string, flags: InitFlags) {
  const force = !!flags.yes;
  const created: string[] = [];
  const abs = (p: string) => path.resolve(targetDir, p);

  const files: FileSpec[] = [
    { rel: "ilconfig.json", content: ilconfig },
    {
      rel: "src/hello.il",
      content: flags.template === "tests" ? helloWithTests : helloMinimal,
    },
  ];

  try {
    for (const f of files) {
      const p = abs(f.rel);
      writeFileSafe(p, f.content, force);
      created.push(p);
    }

    if (flags.json) {
      handleJsonOutput({
        kind: "init",
        flags,
        diagnostics: [],
        errors: 0,
        warnings: 0,
        code: 0,
        created,
        message: "Project initialized",
      });
      return;
    }

    console.log(colors.green("✔ Project initialized"));
    for (const p of created) {
      console.log("  " + colors.cyan(path.relative(process.cwd(), p)));
    }
    console.log(
      "\nNext steps:\n" +
        "  - Add more .il files under src/\n" +
        "  - Run: intent check --strict\n" +
        "  - Build: intent build -t ts -o dist\n",
    );
    process.exitCode = 0;
  } catch (e: any) {
    const message =
      e?.cliCode === "ILC0403" ? String(e.message) : "Initialization failed.";
    try {
      failUsage(flags, "ILC0403", message);
    } catch {}
  }
}
