import fs from "node:fs";
import path from "node:path";
import { colors } from "../../term/colors.js";
import { handleJsonOutput } from "../../utils/output.js";
import { failUsage } from "../../utils/cli-error.js";
import type { InitFlags } from "./types.js";
import { SPEC, type Option } from "../../options.js";

type FileSpec = { rel: string; content: string };

/** Mapea "--kebab-name" → "camelName" */
function nameToProp(longName: string): string {
  const s = longName.replace(/^--/, "");
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** Renderiza un valor JS a JSON inline (sin ident). */
function jsonValue(v: unknown): string {
  if (v === undefined) return "undefined";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return JSON.stringify(v);
}

/** Lista blanca: opciones que pueden vivir en compilerOptions del ilconfig. */
const CONFIG_ALLOW = new Set<string>([
  // global
  "--strict",
  "--seed-rng",
  "--seed-clock",
  "--max-errors",
  "--no-color",
  // build
  "--target",
  "--out", // alias de --outDir
  "--outDir",
  "--sourcemap",
  // test
  "--reporter",
  "--bail",
  "--only",
]);

/** Cuáles dejamos ACTIVOS por defecto en el archivo generado. */
const ACTIVE_BY_DEFAULT = new Set<string>(["--strict", "--target", "--outDir"]);

/** Agrupa y ordena opciones por el SPEC, filtra, y las renderiza como JSONC. */
function renderCompilerOptionsFromSpec(): string {
  const lines: string[] = [];
  const groups = SPEC.groups
    .filter((g) => ["global", "build", "test"].includes(g.id))
    .map((g) => ({
      id: g.id,
      title:
        g.id === "global" ? "Global" : g.id[0].toUpperCase() + g.id.slice(1),
      options: g.options
        .filter((o) => o.name.startsWith("--") && CONFIG_ALLOW.has(o.name))
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));

  for (const group of groups) {
    lines.push(`    // --- ${group.title} options ---`);
    for (const o of group.options) {
      const prop = nameToProp(o.name);
      // descripción + (enum) + notas
      const descBits = [o.description].filter(Boolean) as string[];
      const enumHint =
        o.kind === "enum" && o.enumValues?.length
          ? `Allowed: ${o.enumValues.join(" | ")}`
          : "";
      if (enumHint) descBits.push(enumHint);
      if (o.notes?.length) descBits.push(...o.notes);

      for (const d of descBits) lines.push(`    // ${d}`);
      const defShown =
        o.default === null
          ? "null"
          : o.default === undefined
            ? undefined
            : jsonValue(o.default);

      const active = ACTIVE_BY_DEFAULT.has(o.name);
      const key = `"${prop}"`;
      if (active) {
        // dejamos activas sólo las básicas
        const value =
          // normalizamos algunos defaults con sentido para init
          o.name === "--outDir"
            ? jsonValue("dist")
            : o.name === "--target"
              ? jsonValue("ts")
              : (defShown ??
                (o.kind === "string" ? jsonValue("") : jsonValue(false)));
        lines.push(`    ${key}: ${value},`);
      } else {
        const placeholder =
          defShown ??
          (o.kind === "string"
            ? `"${prop === "only" ? "pattern" : ""}"`
            : o.kind === "number"
              ? "0"
              : o.kind === "enum"
                ? o.enumValues?.[0]
                  ? JSON.stringify(o.enumValues[0])
                  : "null"
                : "false");
        lines.push(`    // ${key}: ${placeholder},`);
      }
      if (o.examples?.length) {
        for (const ex of o.examples) {
          if (ex.cli) lines.push(`    // e.g. ${ex.cli}`);
        }
      }
      lines.push(""); // línea en blanco entre opciones
    }
  }
  return lines.join("\n");
}

/** Crea el contenido JSONC final de ilconfig.json (determinista). */
function buildIlconfigJsonc(): string {
  const compilerOptions = renderCompilerOptionsFromSpec();
  const body =
    `{
  // IntentLang project config (JSON with comments)
  // Enable/disable options by uncommenting the entries below.

  "compilerOptions": {
${compilerOptions}
  },

  // Globs of files to include/exclude (like tsconfig).
  "include": ["src/**/*.il"],
  // "exclude": ["**/node_modules/**", "dist/**"]
}
`.replace(/\s+$/m, "") + "\n";

  return body;
}

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
    { rel: "ilconfig.json", content: buildIlconfigJsonc() },
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
